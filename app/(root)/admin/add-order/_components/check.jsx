import useProductStore from "@/store/event";
import { Minus, Plus } from "lucide-react";
import React from "react";

const Check = ({ products, productsData, categoryData }) => {
  const {
      minusDiscount,
    plusDiscount,
    incrementCount,
    decrementCount,
    discountProducts,
  } = useProductStore();

  const noDisccountCategories = categoryData?.filter(
    (c) => +c?.nodiscount == 1
  );
  const noDiscountProducts = categoryData?.filter((p) => +p?.nodiscount == 1);
  console.log({discountProducts})
  return (
    <main className="p-3">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-thin px-2 textSmall1 py-1 text-left">
              Наименование
            </th>
            <th className="text-thin px-2 textSmall1 py-1 text-center">
              Кол-во
            </th>
            <th className="text-thin px-2 textSmall1 py-1 text-right">
              Цена (сум)
            </th>
            <th className="text-thin px-2 textSmall1 py-1 text-right">
              Итого (сум)
            </th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 || discountProducts?.length > 0 ? (
            <>
              {products?.map((item, index) => {
                const renderRow = (
                  name,
                  count,
                  product_id,
                  modif_id,
                  price
                ) => {
                  let findDiscount = null,
                    prs = 0;
                  if (item?.discounts?.length > 0) {
                    findDiscount = item?.discounts?.find(
                      (disc) => disc?.active
                    );
                  }

                  if (findDiscount) {
                    if (findDiscount?.params?.result_type == 2) {
                      prs = Math.max(
                        0,
                        price - findDiscount?.params.discount_value / 100
                      );
                    } else if (findDiscount?.params?.result_type == 3) {
                      prs =
                        (price * (100 - +findDiscount?.params.discount_value)) /
                        100;
                    }
                  }
                  return (
                    <tr key={`${index}-${name}`} className="border-b">
                      <td className="min-w-32 max-w-32 text-foreground px-2 py-1 textSmall2 text-left">
                        <h1 className="w-full">{name}</h1>
                        {findDiscount && (
                          <p className="textSmall1 font-bold">
                            {findDiscount?.name}
                          </p>
                        )}
                      </td>
                      <td className="text-thin px-2 py-1 textSmall2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              incrementCount(
                                product_id,
                                modif_id && modif_id,
                                noDiscountProducts,
                                noDisccountCategories
                              );
                            }}
                            className="p-1 text-primary hover:bg-border rounded-full shadow-md 
              active:bg-gray-100 transition-all ease-linear duration-100"
                          >
                            <Plus size={18} />
                          </button>
                          <h1 className="min-w-4">{count}</h1>
                          <button
                            onClick={() =>
                              decrementCount(
                                product_id,
                                modif_id && modif_id,
                                noDiscountProducts,
                                noDisccountCategories
                              )
                            }
                            className="p-1 text-primary hover:bg-border rounded-full shadow-md 
              active:bg-gray-100 transition-all ease-linear duration-100"
                          >
                            <Minus size={18} />
                          </button>
                        </div>
                      </td>
                      {findDiscount ? (
                        <td className="text-thin px-2 py-1 textSmall2 text-right">
                          <h1 className=""> {prs} </h1>
                          <p className="textSmall1 line-through">{price} </p>
                          сум
                        </td>
                      ) : (
                        <td className="text-thin px-2 py-1 textSmall2 text-right">
                          <h1 className=""> {price} </h1>
                          сум
                        </td>
                      )}
                      <td className="text-thin px-2 py-1 textSmall2 text-right">
                        {findDiscount ? (
                          <h1>{prs * count}</h1>
                        ) : (
                          <h1>{price * count}</h1>
                        )}
                        сум
                      </td>
                    </tr>
                  );
                };

                if (item?.modifications?.length > 0) {
                  return (
                    <React.Fragment key={index}>
                      {item.modifications.map((m, i) =>
                        renderRow(
                          `${item?.product_name} ${m?.modificator_name}`,
                          m?.count,
                          item?.product_id,
                          m?.modificator_id,
                          Number(m?.spots[0]?.price) / 100
                        )
                      )}
                    </React.Fragment>
                  );
                } else {
                  return renderRow(
                    item?.product_name,
                    item?.count,
                    item?.product_id,
                    0,
                    Number(item?.price["1"]) / 100
                  );
                }
              })}
              {discountProducts.length > 0 && (
                <>
                  {discountProducts
                    ?.slice()
                    .reverse()
                    .map((item, index) => {
                      const renderRow = (
                        name,
                        count,
                        product_id,
                        modif_id,
                        price,
                        discount
                      ) => {
                        if (!discount?.active) {
                          return null;
                        }
                        let prs;
                        if (discount?.params?.result_type == 2) {
                          prs = Math.max(
                            0,
                            price - discount?.params.discount_value / 100
                          );
                        } else if (discount?.params?.result_type == 3) {
                          prs =
                            (price * (100 - +discount?.params.discount_value)) /
                            100;
                        }

                        return (
                          <tr key={`${index}-${name}`} className="border-b">
                            <td className="text-foreground px-2 py-1 textSmall2 text-left">
                              {name}
                              {discount && (
                                <p className="textSmall1 font-bold">
                                  {discount?.name}
                                </p>
                              )}
                            </td>
                            <td className="text-thin px-2 py-1 textSmall2 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => plusDiscount(item)}
                                  className="p-1 text-primary hover:bg-border rounded-full shadow-md 
                active:bg-gray-100 transition-all ease-linear duration-100"
                                >
                                  <Plus size={18} />
                                </button>
                                <h1 className="min-w-4">{count}</h1>
                                <button
                                  onClick={() => minusDiscount(item)}
                                  className="p-1 text-primary hover:bg-border rounded-full shadow-md 
                active:bg-gray-100 transition-all ease-linear duration-100"
                                >
                                  <Minus size={18} />
                                </button>
                              </div>
                            </td>
                            <td className="text-thin px-2 py-1 textSmall2 text-right">
                              <h1 className=""> {prs} </h1>
                              <p className="textSmall1 line-through">
                                {price}{" "}
                              </p>
                              сум
                            </td>
                            <td className="text-thin px-2 py-1 textSmall2 text-right">
                              <h1>{prs * count}</h1>
                              сум
                            </td>
                          </tr>
                        );
                      };

                      if (item?.modifications?.length > 0) {
                        return (
                          <React.Fragment key={index}>
                            {item.modifications.map((m, i) =>
                              renderRow(
                                `${item?.product_name} ${m?.modificator_name}`,
                                m?.count,
                                item?.product_id,
                                m?.modificator_id,
                                Number(m?.spots[0]?.price) / 100,
                                item.discount
                              )
                            )}
                          </React.Fragment>
                        );
                      } else {
                        return renderRow(
                          item?.product_name,
                          item?.count,
                          item?.product_id,
                          0,
                          Number(item?.price["1"]) / 100,
                          item.discount
                        );
                      }
                    })}
                </>
              )}
            </>
          ) : (
            <tr>
              <td
                colSpan="4"
                className="text-foreground text-center textSmall2 py-1"
              >
                Товары недоступны
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
};
export default Check;
