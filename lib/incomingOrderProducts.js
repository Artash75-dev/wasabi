const toPosterPrice = (price, fallbackPrice) => {
  if (price && typeof price === "object") {
    return price;
  }

  const numericPrice = Number(price);
  if (Number.isFinite(numericPrice)) {
    return {
      ...(fallbackPrice && typeof fallbackPrice === "object"
        ? fallbackPrice
        : {}),
      1: numericPrice * 100,
    };
  }

  return fallbackPrice;
};

export const mergeIncomingOrderProduct = (catalogProduct, incomingProduct) => {
  const hasPromotion =
    Number(incomingProduct?.promotion_id) > 0 &&
    Number(incomingProduct?.result_type) > 0;
  const price = hasPromotion
    ? incomingProduct?.original_price ?? catalogProduct?.price
    : incomingProduct?.price ?? catalogProduct?.price;

  const resultType = Number(incomingProduct?.result_type) || 0;
  const incomingPrice = Number(incomingProduct?.price);
  const originalPrice = Number(toPosterPrice(price, catalogProduct?.price)?.["1"]) / 100;

  return {
    ...catalogProduct,
    ...incomingProduct,
    product_name: String(
      incomingProduct?.product_name || catalogProduct?.product_name || ""
    )
      .split("$")[0]
      .trim(),
    incoming_price: incomingPrice,
    price: toPosterPrice(price, catalogProduct?.price),
    isBonusProduct:
      resultType === 1 ? true : incomingProduct?.isBonusProduct || false,
    bonusDiscountPercent:
      resultType === 1 && originalPrice > 0 && Number.isFinite(incomingPrice)
        ? ((originalPrice - incomingPrice) / originalPrice) * 100
        : incomingProduct?.bonusDiscountPercent,
    fixedPrice:
      resultType === 4 && Number.isFinite(incomingPrice)
        ? incomingPrice
        : incomingProduct?.fixedPrice,
    isImportedPromotion: hasPromotion,
  };
};

export const buildIncomingPromotion = (product) => {
  if (
    !(Number(product?.promotion_id) > 0) ||
    !(Number(product?.result_type) > 0)
  ) {
    return null;
  }

  const resultType = Number(product.result_type);
  const originalPrice = Number(product?.price?.["1"]) / 100;
  const incomingPrice = Number(product?.incoming_price);
  let discountValue = Number(product.discount_value) || 0;

  if (
    discountValue === 0 &&
    originalPrice > 0 &&
    Number.isFinite(incomingPrice) &&
    incomingPrice < originalPrice
  ) {
    discountValue =
      resultType === 3
        ? ((originalPrice - incomingPrice) / originalPrice) * 100
        : originalPrice - incomingPrice;
  }

  return {
    promotion_id: Number(product.promotion_id),
    name: product.promotion_name || `Акция №${product.promotion_id}`,
    active: true,
    params: {
      result_type: resultType,
      discount_value:
        resultType === 2 ? Math.round(discountValue * 100) : discountValue,
    },
  };
};

export const createOrderProductsSignature = (products = []) =>
  products
    .map((product) => ({
      product_id: Number(product?.product_id) || 0,
      count: Number(product?.count) || 0,
      promotion_id:
        Number(product?.promotion_id || product?.discount?.promotion_id) || 0,
      promotion_active: product?.discount
        ? product.discount.active !== false
        : Boolean(product?.promotion_id),
      result_type:
        Number(
          product?.result_type ??
            product?.resultType ??
            product?.discount?.params?.result_type
        ) || 0,
      cart_key: product?.cartKey || "",
    }))
    .sort((a, b) =>
      `${a.product_id}:${a.promotion_id}:${a.cart_key}`.localeCompare(
        `${b.product_id}:${b.promotion_id}:${b.cart_key}`
      )
    )
    .map(
      (product) =>
        `${product.product_id}:${product.count}:${product.promotion_id}:${
          product.promotion_active ? 1 : 0
        }:${product.result_type}:${product.cart_key}`
    )
    .join("|");

export const summarizeImportedOrderProducts = (products = []) =>
  products.reduce(
    (summary, product) => {
      const count = Math.max(0, Number(product?.count) || 0);
      const originalPrice = Number(product?.price?.["1"]) / 100;
      const importedPrice = Number(product?.incoming_price);
      const effectivePrice = Number.isFinite(importedPrice)
        ? importedPrice
        : Number.isFinite(originalPrice)
          ? originalPrice
          : 0;

      summary.total += effectivePrice * count;
      summary.discount += Math.max(0, originalPrice - effectivePrice) * count;
      return summary;
    },
    { total: 0, discount: 0 }
  );

export const getImportedOrderSubtotal = ({
  total,
  deliveryPrice,
  serviceMode,
}) =>
  Math.max(
    0,
    (Number(total) || 0) -
      (Number(serviceMode) === 3 ? Number(deliveryPrice) || 0 : 0)
  );
