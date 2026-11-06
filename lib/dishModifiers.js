const toPositiveInteger = (value, fallback = 0) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return Math.trunc(parsed);
};

export const getDishModificationGroups = (product) =>
  (Array.isArray(product?.group_modifications)
    ? product.group_modifications
    : []
  )
    .filter((group) => Number(group?.is_deleted || 0) !== 1)
    .map((group) => ({
      ...group,
      num_min: toPositiveInteger(group?.num_min),
      num_max: Math.max(
        toPositiveInteger(group?.num_min),
        toPositiveInteger(group?.num_max, 1)
      ),
      modifications: Array.isArray(group?.modifications)
        ? group.modifications.filter(
            (modification) => Number(modification?.is_deleted || 0) !== 1
          )
        : [],
    }))
    .filter((group) => group.modifications.length > 0);

export const hasDishModifications = (product) =>
  getDishModificationGroups(product).length > 0;

export const isDishModificationSelectionValid = (
  groups = [],
  selections = []
) =>
  groups.every((group) => {
    const selectedCount = selections
      .filter(
        (selection) =>
          Number(selection?.dish_modification_group_id) ===
          Number(group?.dish_modification_group_id)
      )
      .reduce(
        (total, selection) =>
          total + Math.max(1, toPositiveInteger(selection?.quantity, 1)),
        0
      );

    return selectedCount >= group.num_min && selectedCount <= group.num_max;
  });

export const createDishModificationSelectionKey = (selections = []) =>
  selections
    .map((selection) => ({
      id: Number(selection?.dish_modification_id),
      quantity: Math.max(1, toPositiveInteger(selection?.quantity, 1)),
    }))
    .filter((selection) => Number.isFinite(selection.id) && selection.id > 0)
    .sort((left, right) => left.id - right.id)
    .map((selection) => `${selection.id}:${selection.quantity}`)
    .join("|");

export const createDishModificationCartKey = (productId, selections = []) =>
  `${productId}:dish:${createDishModificationSelectionKey(selections)}`;

export const serializeDishModificationsForPoster = (selections = []) => {
  const posterModifications = selections
    .map((selection) => ({
      m: Number(selection?.dish_modification_id),
      a: Math.max(1, toPositiveInteger(selection?.quantity, 1)),
    }))
    .filter((selection) => Number.isFinite(selection.m) && selection.m > 0);

  return posterModifications.length > 0
    ? JSON.stringify(posterModifications)
    : undefined;
};

export const getDishModificationPrice = (selections = []) =>
  selections.reduce(
    (total, selection) =>
      total +
      Number(selection?.price || 0) *
        Math.max(1, toPositiveInteger(selection?.quantity, 1)),
    0
  );

export const getDishModificationLabel = (selections = []) =>
  selections
    .map((selection) => {
      const quantity = Math.max(1, toPositiveInteger(selection?.quantity, 1));
      return `${selection?.name || "Модификатор"}${
        quantity > 1 ? ` × ${quantity}` : ""
      }`;
    })
    .join(", ");

