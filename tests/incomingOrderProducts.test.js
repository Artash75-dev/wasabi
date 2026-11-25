import assert from "node:assert/strict";
import test from "node:test";

import {
  buildIncomingPromotion,
  mergeIncomingOrderProduct,
} from "../lib/incomingOrderProducts.js";

test("restores an imported percentage promotion using the original price", () => {
  const product = mergeIncomingOrderProduct(
    { product_id: 52, price: { 1: 5100000 } },
    {
      product_id: 52,
      price: 43350,
      original_price: 51000,
      promotion_id: 156,
      result_type: 3,
      discount_value: 15,
    }
  );
  const promotion = buildIncomingPromotion(product);

  assert.equal(product.price["1"], 5100000);
  assert.equal(promotion.params.result_type, 3);
  assert.equal(promotion.params.discount_value, 15);
  const discountedProductPrice =
    (product.price["1"] / 100) *
      (100 - promotion.params.discount_value) /
    100;

  assert.equal(discountedProductPrice, 43350);
  assert.equal(product.price["1"] / 100 - discountedProductPrice, 7650);
  assert.equal(discountedProductPrice + 2000, 45350);
});

test("keeps an imported regular product price", () => {
  const product = mergeIncomingOrderProduct(
    { product_id: 384, price: { 1: 250000 } },
    { product_id: 384, price: 2000 }
  );

  assert.equal(product.price["1"], 200000);
  assert.equal(buildIncomingPromotion(product), null);
});

test("derives a missing promotion percentage from the imported price", () => {
  const product = mergeIncomingOrderProduct(
    { product_id: 123, price: { 1: 1700000 } },
    {
      product_id: 123,
      price: 14450,
      promotion_id: 156,
      result_type: 3,
    }
  );
  const promotion = buildIncomingPromotion(product);

  assert.equal(product.price["1"], 1700000);
  assert.equal(product.incoming_price, 14450);
  assert.equal(promotion.params.discount_value, 15);
  assert.equal(
    (product.price["1"] / 100) *
      (100 - promotion.params.discount_value) /
      100,
    14450
  );
});

test("restores a free 1+1 result and cleans the Poster service suffix", () => {
  const product = mergeIncomingOrderProduct(
    {
      product_id: 123,
      product_name: "Хлеб с Чесночным соусом $service-data",
      price: { 1: 1700000 },
    },
    {
      product_id: 123,
      price: 0,
      promotion_id: 333,
      result_type: 1,
    }
  );

  assert.equal(product.product_name, "Хлеб с Чесночным соусом");
  assert.equal(product.price["1"], 1700000);
  assert.equal(product.incoming_price, 0);
  assert.equal(product.isBonusProduct, true);
  assert.equal(product.bonusDiscountPercent, 100);
});

test("restores a fixed promotion price", () => {
  const product = mergeIncomingOrderProduct(
    { product_id: 122, price: { 1: 1700000 } },
    {
      product_id: 122,
      price: 5000,
      promotion_id: 334,
      result_type: 4,
    }
  );

  assert.equal(product.price["1"], 1700000);
  assert.equal(product.fixedPrice, 5000);
  assert.equal(product.price["1"] / 100 - product.fixedPrice, 12000);
});
