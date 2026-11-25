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
