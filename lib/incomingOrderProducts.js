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

  return {
    ...catalogProduct,
    ...incomingProduct,
    incoming_price: incomingProduct?.price,
    price: toPosterPrice(price, catalogProduct?.price),
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
