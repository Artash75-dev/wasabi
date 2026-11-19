export const toAdminProductSummary = (product = {}) => {
  const {
    ingredients: _ingredients,
    product_production_description: _productionDescription,
    profit: _profit,
    ...summary
  } = product;

  return summary;
};

export const toAdminProductSummaries = (products = []) =>
  Array.isArray(products) ? products.map(toAdminProductSummary) : [];
