import assert from "node:assert/strict";
import test from "node:test";

import { toAdminProductSummary } from "../lib/posterProducts.js";

test("removes heavy recipe fields from the admin product list", () => {
  const summary = toAdminProductSummary({
    product_id: "572",
    product_name: "Кидс бокс",
    ingredients: [{ ingredient_id: 1, name: "Рис" }],
    product_production_description: "Технологическая инструкция",
    profit: { 1: 1000 },
    price: { 1: 6900000 },
    sources: [{ id: 1, name: "Сайт", price: 6900000, visible: 1 }],
    modifications: [{ modificator_id: 10 }],
    group_modifications: [
      {
        dish_modification_group_id: 46,
        modifications: [{ dish_modification_id: 183, name: "Яблоко" }],
      },
    ],
  });

  assert.equal(summary.ingredients, undefined);
  assert.equal(summary.product_production_description, undefined);
  assert.equal(summary.profit, undefined);
  assert.equal(summary.product_id, "572");
  assert.equal(summary.sources.length, 1);
  assert.deepEqual(summary.sources[0], { id: 1, price: 6900000 });
  assert.equal(summary.modifications.length, 1);
  assert.equal(summary.group_modifications[0].modifications.length, 1);
});
