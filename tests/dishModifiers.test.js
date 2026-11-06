import assert from "node:assert/strict";
import test from "node:test";

import {
  createDishModificationCartKey,
  getDishModificationLabel,
  getDishModificationGroups,
  getDishModificationPrice,
  isDishModificationSelectionValid,
  serializeDishModificationsForPoster,
} from "../lib/dishModifiers.js";

const kidsBox = {
  product_id: "572",
  group_modifications: [
    {
      dish_modification_group_id: 46,
      name: "Сок",
      num_min: 1,
      num_max: 1,
      modifications: [
        { dish_modification_id: 181, name: "Вишня", price: 0 },
        { dish_modification_id: 183, name: "Яблоко", price: 0 },
        { dish_modification_id: 184, name: "Банан", price: 0 },
      ],
    },
  ],
};

test("reads Poster dish modification groups", () => {
  const groups = getDishModificationGroups(kidsBox);

  assert.equal(groups.length, 1);
  assert.equal(groups[0].name, "Сок");
  assert.equal(groups[0].modifications.length, 3);
});

test("serializes selected dish modifier for incomingOrders", () => {
  assert.equal(
    serializeDishModificationsForPoster([
      { dish_modification_id: 181, quantity: 1 },
    ]),
    '[{"m":181,"a":1}]'
  );
});

test("requires the mandatory Poster modification group", () => {
  const groups = getDishModificationGroups(kidsBox);

  assert.equal(isDishModificationSelectionValid(groups, []), false);
  assert.equal(
    isDishModificationSelectionValid(groups, [
      {
        dish_modification_group_id: 46,
        dish_modification_id: 183,
        quantity: 1,
      },
    ]),
    true
  );
});

test("filters deleted Poster groups and modifications", () => {
  const groups = getDishModificationGroups({
    group_modifications: [
      {
        dish_modification_group_id: 1,
        is_deleted: 1,
        modifications: [{ dish_modification_id: 1 }],
      },
      {
        dish_modification_group_id: 2,
        num_min: "0",
        num_max: "1",
        modifications: [
          { dish_modification_id: 2, is_deleted: 1 },
          { dish_modification_id: 3, is_deleted: 0 },
        ],
      },
    ],
  });

  assert.equal(groups.length, 1);
  assert.equal(groups[0].dish_modification_group_id, 2);
  assert.deepEqual(
    groups[0].modifications.map((item) => item.dish_modification_id),
    [3]
  );
});

test("creates a stable cart key for each modifier combination", () => {
  const first = createDishModificationCartKey("572", [
    { dish_modification_id: 184, quantity: 1 },
    { dish_modification_id: 181, quantity: 1 },
  ]);
  const second = createDishModificationCartKey("572", [
    { dish_modification_id: 181, quantity: 1 },
    { dish_modification_id: 184, quantity: 1 },
  ]);

  assert.equal(first, second);
});

test("keeps different juice choices on separate cart lines", () => {
  const apple = createDishModificationCartKey("572", [
    { dish_modification_id: 183, quantity: 1 },
  ]);
  const banana = createDishModificationCartKey("572", [
    { dish_modification_id: 184, quantity: 1 },
  ]);

  assert.notEqual(apple, banana);
});

test("includes modifier price and label in the order", () => {
  const selections = [{ name: "Дополнительный сок", price: 2500, quantity: 2 }];

  assert.equal(getDishModificationPrice(selections), 5000);
  assert.equal(getDishModificationLabel(selections), "Дополнительный сок × 2");
});
