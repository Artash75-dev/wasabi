export const toAdminProductSummary = (product = {}) => ({
  product_id: product.product_id,
  product_name: product.product_name,
  menu_category_id: product.menu_category_id,
  category_name: product.category_name,
  price: product.price,
  photo: product.photo,
  photo_origin: product.photo_origin,
  nodiscount: product.nodiscount,
  modifications: Array.isArray(product.modifications)
    ? product.modifications
    : [],
  group_modifications: Array.isArray(product.group_modifications)
    ? product.group_modifications
    : [],
  sources: Array.isArray(product.sources)
    ? product.sources.map((source) => ({
        id: source.id,
        price: source.price,
      }))
    : [],
});

export const toAdminProductSummaries = (products = []) =>
  Array.isArray(products) ? products.map(toAdminProductSummary) : [];
