"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getDishModificationGroups,
  isDishModificationSelectionValid,
} from "@/lib/dishModifiers";
import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const getGroupId = (group) => String(group.dish_modification_group_id);

export default function DishModifierDialog({
  product,
  open,
  onOpenChange,
  onConfirm,
}) {
  const groups = useMemo(() => getDishModificationGroups(product), [product]);
  const [selectedByGroup, setSelectedByGroup] = useState({});

  useEffect(() => {
    if (open) {
      setSelectedByGroup({});
    }
  }, [open, product?.product_id]);

  const selectModification = (group, modification) => {
    const groupId = getGroupId(group);

    setSelectedByGroup((current) => {
      const selected = current[groupId] || [];
      const modificationId = Number(modification.dish_modification_id);
      const isSelected = selected.some(
        (item) => Number(item.dish_modification_id) === modificationId
      );

      if (group.num_max === 1) {
        return {
          ...current,
          [groupId]: [
            {
              ...modification,
              quantity: 1,
              dish_modification_group_id:
                group.dish_modification_group_id,
              group_name: group.name,
            },
          ],
        };
      }

      if (isSelected) {
        return {
          ...current,
          [groupId]: selected.filter(
            (item) =>
              Number(item.dish_modification_id) !== modificationId
          ),
        };
      }

      if (selected.length >= group.num_max) {
        return current;
      }

      return {
        ...current,
        [groupId]: [
          ...selected,
          {
            ...modification,
            quantity: 1,
            dish_modification_group_id: group.dish_modification_group_id,
            group_name: group.name,
          },
        ],
      };
    });
  };

  const selectedModifications = Object.values(selectedByGroup).flat();
  const isValid = isDishModificationSelectionValid(
    groups,
    selectedModifications
  );

  const handleConfirm = () => {
    if (!isValid) {
      return;
    }

    onConfirm(selectedModifications);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent isClose className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{product?.product_name || "Выберите модификатор"}</DialogTitle>
          <DialogDescription>
            Выберите варианты техкарты перед добавлением товара в чек.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto py-2">
          {groups.map((group) => {
            const groupId = getGroupId(group);
            const selected = selectedByGroup[groupId] || [];

            return (
              <section key={groupId} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{group.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {group.num_min > 0 ? "Обязательно" : "Необязательно"}
                    {group.num_max > 1 ? ` · до ${group.num_max}` : ""}
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {group.modifications.map((modification) => {
                    const isSelected = selected.some(
                      (item) =>
                        Number(item.dish_modification_id) ===
                        Number(modification.dish_modification_id)
                    );
                    const extraPrice = Number(modification.price || 0) / 100;

                    return (
                      <button
                        key={modification.dish_modification_id}
                        type="button"
                        onClick={() =>
                          selectModification(group, modification)
                        }
                        className={`flex min-h-14 items-center justify-between gap-3 rounded-md border p-3 text-left transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <span className="text-sm font-medium">
                          {modification.name}
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          {extraPrice > 0 && (
                            <span className="text-xs text-muted-foreground">
                              +{extraPrice} сум
                            </span>
                          )}
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground"
                            }`}
                          >
                            {isSelected && <Check size={14} />}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button type="button" disabled={!isValid} onClick={handleConfirm}>
            Добавить в чек
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
