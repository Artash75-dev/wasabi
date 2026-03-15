import { create } from "zustand";

const buildPromotionTriggerSnapshot = (products = []) =>
  [...products]
    .filter((product) => !product?.isBonusProduct && +product?.count > 0)
    .sort((a, b) => +a.product_id - +b.product_id)
    .map((product) => ({
      id: +product.product_id,
      count: +product.count,
    }));

const buildBonusDiscountProduct = ({
  bonusProductData,
  discount,
  isAutoApply,
  countDisc,
  conditionType,
  conditionProductId = null,
  resultProductCount,
  bonusDiscountPercent,
  promotionTrigger,
}) => ({
  ...bonusProductData,
  count: resultProductCount,
  countDisc,
  discount: { ...discount, active: isAutoApply },
  isBonusProduct: true,
  resultType: 1,
  conditionType,
  conditionProductId,
  resultProductId: +bonusProductData.product_id,
  resultProductCount,
  bonusDiscountPercent,
  promotionTrigger,
});

const buildFixedPriceDiscountProduct = ({
  product,
  discount,
  isAutoApply,
  countDisc,
  fixedPrice,
  productCount,
  conditionType,
}) => ({
  ...product,
  count: isAutoApply ? productCount : 0,
  countDisc,
  discount: { ...discount, active: isAutoApply },
  resultType: 4,
  conditionType,
  fixedPrice,
  productCount,
});

export const useEvent = create((set) => ({
  activeTab: 1,
  timeRange: "1d",
  reflesh: false,
  reload: false,
  clients: [],
  searchValue: [],
  clientInfoData: null,
  searchFocus: false,
  searchClientValue: "",
  setSearchValue: (data) => set(() => ({ searchValue: data ? data : "" })),
  setSearchFocus: (data) => set(() => ({ searchFocus: data })),
  setClients: (data) => set(() => ({ clients: data })),
  setSearchClientValue: (data) =>
    set(() => ({ searchClientValue: data ? data : "" })),
  setActiveTab: (data) => set(() => ({ activeTab: data ? data : 1 })),
  setTimeRange: (data) => set(() => ({ timeRange: data })),
  setClientInfoData: (data) => set(() => ({ clientInfoData: data })),
  setReflesh: () => set((state) => ({ reflesh: !state.reflesh })),
  setReload: () => set((state) => ({ reload: !state.reload })),
}));

export const orderCreateInfo = create((set) => ({
  discountsNames: [],
  orderData: {
    spot_id: 0,
    spot_name: "",
    phone: "",
    products: [],
    service_mode: 3,
    payment_method: "Наличными",
    total: 0,
    delivery_price: 0,
    chat_id: 0,
    location: {},
    status: "created",
    client: null,
    discountPrice: 0,
    pay_cash: null,
    pay_card: null,
    pay_click: null,
    pay_payme: null,
    pay_bonus: null,
    pay_sertificate: null,
    client_comment: "",
    comment: "",
    address: "",
    stick_count: null,
    delivery_time: 60,
  },
  setOrderData: (data) =>
    set((state) => ({
      orderData:
        typeof data === "function" ? data(state.orderData) : data,
    })),
  setDiscountsNames: (data) => set(() => ({ discountsNames: data })),
}));

export const deliveryStore = create((set) => ({
  discounts: [],
  setDiscountDelivery: (data) => set(() => ({ discounts: data })),
}));

const useProductStore = create((set) => ({
  products: [],
  discounts: [],
  discountProducts: [],
  initializeDiscounts: () => {
    const saveDiscounts = localStorage.getItem("discounts");
    const parsedDiscounts = saveDiscounts ? JSON.parse(saveDiscounts) : [];
    set({ discounts: parsedDiscounts });
  },
  initializeProducts: () => {
    const savedProducts = localStorage.getItem("products");
    const parsedProducts = savedProducts ? JSON.parse(savedProducts) : [];
    set({ products: parsedProducts });
  },
  initializeDiscountProducts: () => {
    const savedProducts = localStorage.getItem("discountProducts");
    const parsedProducts = savedProducts ? JSON.parse(savedProducts) : [];
    set({ discountProducts: parsedProducts });
  },
  setProductsData: (data) =>
    set(() => {
      localStorage.setItem("products", JSON.stringify(data));
      return {
        products: data,
      };
    }),
  setProducts: (data, product, noDiscountProducts, noDisccountCategories, allProductsData) =>
    set((state) => {
      state.initializeProducts();
      state.initializeDiscountProducts();
      let updatedProducts,
        updatedDiscountProducts = [...state.discountProducts];
      //modificator count
      if (product?.product_id) {
        // Find the product by ID in the state
        const findProduct = state.products.find(
          (p) => p.product_id === product.product_id
        );

        if (findProduct) {
          const hasModificator = findProduct.modifications.some(
            (mod) => mod.modificator_id == data?.modificator_id
          );

          updatedProducts = state.products.map((p) =>
            p.product_id === product.product_id
              ? {
                  ...p,
                  modifications: hasModificator
                    ? p.modifications.map((mod) =>
                        mod.modificator_id == data.modificator_id
                          ? { ...mod, count: mod.count + 1 }
                          : mod
                      )
                    : [...p.modifications, { ...data, count: 1 }],
                }
              : p
          );
        } else {
          // Product not found, add it with the modificator
          updatedProducts = [
            ...state.products,
            { ...product, count: 1, modifications: [{ ...data, count: 1 }] },
          ];
        }
      } else {
        //product count
        updatedProducts = state.products.some(
          (p) => p.product_id === data.product_id
        )
          ? state.products.map((p) =>
              p.product_id === data.product_id
                ? { ...p, count: p.count + 1 }
                : p
            )
          : [...state.products, { ...data, count: 1 }];
      }
      //discount active products
      const activeDiscountProducts = updatedProducts.filter((p) => {
        const activeDiscountPr = noDiscountProducts?.find(
          (ndp) => ndp?.product_id == p?.product_id
        );
        const activeDiscountCt = noDisccountCategories?.find(
          (ndc) => ndc?.category_id == p?.menu_category_id
        );

        if (activeDiscountCt || activeDiscountPr) {
          return false;
        } else {
          return true;
        }
      });

      //canculate discount
      if (activeDiscountProducts?.length > 0) {
        let updatedDiscounts = [...state.discounts];

        for (let i = 0; i < state?.discounts.length; i++) {
          const d = state?.discounts[i];
          const params = d?.params;
          if (params?.conditions_rule == "or") {
            for (let j = 0; j < params?.conditions.length; j++) {
              const c = params?.conditions[j];
              switch (c.type) {
                case 1: // category
                  let filterProductsCategory;
                  filterProductsCategory = activeDiscountProducts.filter(
                    (p) => p?.menu_category_id == c?.id
                  );

                  // result_type=1: bonus product for category condition
                  if (params?.result_type == 1 && filterProductsCategory?.length > 0 && params?.bonus_products?.length > 0) {
                    const condProd = filterProductsCategory.find((p) => +c?.pcs <= p?.count);
                    if (condProd) {
                      const applicationCount =
                        +params?.accumulation_type == 2 &&
                        +params?.conditions_exactly == 1 &&
                        +c?.pcs > 0
                          ? Math.floor((+condProd?.count || 0) / +c?.pcs)
                          : 1;
                      params.bonus_products.forEach((bp) => {
                        const bonusProductData = allProductsData?.find(
                          (p) => +p.product_id === +bp.id
                        );
                        if (bonusProductData) {
                          const alreadyAdded = updatedDiscountProducts?.find(
                            (dsc) =>
                              dsc?.discount?.promotion_id == d.promotion_id &&
                              dsc?.product_id == bonusProductData.product_id
                          );
                          const isAutoApply = +d.auto_apply == 1;
                          if (!alreadyAdded) {
                            updatedDiscountProducts.push(
                              buildBonusDiscountProduct({
                                bonusProductData,
                                discount: d,
                                isAutoApply,
                                countDisc: +c?.pcs,
                                conditionType: 1,
                                conditionProductId: condProd?.product_id,
                                resultProductCount:
                                  (+params.bonus_products_pcs || 1) *
                                  Math.max(1, applicationCount),
                                bonusDiscountPercent:
                                  +params.bonus_products_condition_value || 100,
                                promotionTrigger: [
                                  {
                                    id: +condProd?.product_id,
                                    count: +c?.pcs || 1,
                                  },
                                ],
                              })
                            );
                          } else {
                            updatedDiscountProducts = updatedDiscountProducts.map((discountProduct) =>
                              discountProduct?.discount?.promotion_id == d.promotion_id &&
                              discountProduct?.product_id == bonusProductData.product_id
                                ? {
                                    ...discountProduct,
                                    count:
                                      (+params.bonus_products_pcs || 1) *
                                      Math.max(1, applicationCount),
                                    resultProductCount:
                                      (+params.bonus_products_pcs || 1) *
                                      Math.max(1, applicationCount),
                                    promotionTrigger: [
                                      {
                                        id: +condProd?.product_id,
                                        count: +c?.pcs || 1,
                                      },
                                    ],
                                  }
                                : discountProduct
                            );
                          }
                          updatedDiscounts = updatedDiscounts.map((ds) => {
                            if (ds.promotion_id == d.promotion_id) {
                              return { ...ds, active: true, end: isAutoApply, prodCount: 1 };
                            }
                            return ds;
                          });
                        }
                      });
                    }
                    break;
                  }

                  // result_type=4: fixed price for category condition
                  if (params?.result_type == 4 && filterProductsCategory?.length > 0 && params?.discount_prices?.length > 0) {
                    filterProductsCategory.forEach((prod) => {
                      const discountPrice = params.discount_prices.find(
                        (dp) => +dp.id === +prod.product_id
                      );
                      if (discountPrice && +c?.pcs <= prod?.count) {
                        const alreadyAdded = updatedDiscountProducts?.find(
                          (dsc) =>
                            dsc?.discount?.promotion_id == d.promotion_id &&
                            dsc?.product_id == prod.product_id
                        );
                        if (!alreadyAdded) {
                          const isAutoApply = +d.auto_apply == 1;
                          updatedDiscountProducts.push(
                            buildFixedPriceDiscountProduct({
                              product: prod,
                              discount: d,
                              isAutoApply,
                              countDisc: +c?.pcs,
                              fixedPrice: +discountPrice.price / 100,
                              productCount: prod?.count,
                              conditionType: 1,
                            })
                          );
                          if (isAutoApply) {
                            updatedProducts = updatedProducts.filter((upd) =>
                              upd?.product_id != prod?.product_id
                            );
                          }
                          updatedDiscounts = updatedDiscounts.map((ds) => {
                            if (ds.promotion_id == d.promotion_id) {
                              return { ...ds, active: true, end: isAutoApply, prodCount: 1 };
                            }
                            return ds;
                          });
                        }
                      }
                    });
                    break;
                  }

                  filterProductsCategory?.map((prod) => {
                    // kamida qo'shiladigani - no auto apply
                    if (
                      +d.params?.conditions_exactly == 0 &&
                      +c?.pcs <= prod?.count &&
                      +d?.auto_apply == 0
                    ) {
                      console.log(d, "category discount");
                      const findDiscount = updatedDiscountProducts?.find(
                        (dsc) =>
                          dsc?.discount?.promotion_id == d.promotion_id &&
                          dsc?.product_id == prod?.product_id
                      );
                      if (!findDiscount) {
                        updatedDiscountProducts.push({
                          ...prod,
                          count: prod?.count,
                          countDisc: +c?.pcs,
                          discount: { ...d, active: false },
                        });
                      } else {
                        updatedDiscountProducts = updatedDiscountProducts?.map(
                          (dsc) => {
                            if (
                              dsc?.discount?.promotion_id == d?.promotion_id
                            ) {
                              return {
                                ...dsc,
                                count: findProduct?.count,
                                countDisc: findProduct?.count,
                              };
                            } else return dsc;
                          }
                        );
                      }
                      updatedDiscounts = updatedDiscounts.map((ds) => {
                        if (ds.promotion_id == d.promotion_id) {
                          return {
                            ...ds,
                            active: true,
                          };
                        }
                        return ds;
                      });
                    }
                    //aniq qo'shiladigan
                    //aniq nechtadir product bo'lganda ishlaydigani va bitta chekda 1 ta aksiya
                    if (params?.accumulation_type == 1) {
                      if (
                        +d.params.conditions_exactly == 1 &&
                        +c?.pcs == prod?.count
                      ) {
                        if (+d.auto_apply == 0) {
                          const findDiscount = updatedDiscountProducts?.find(
                            (dsc) =>
                              dsc?.discount?.promotion_id == d.promotion_id &&
                              dsc?.product_id == prod?.product_id
                          );
                          if (!findDiscount) {
                            updatedDiscountProducts.push({
                              ...prod,
                              count: prod?.count,
                              countDisc: +c?.pcs,
                              discount: { ...d, active: false },
                            });
                          }

                          updatedDiscounts = updatedDiscounts.map((ds) => {
                            if (ds.promotion_id == d.promotion_id) {
                              return {
                                ...ds,
                                active: true,
                              };
                            }
                            return ds;
                          });
                        }
                        if (+d.auto_apply == 1) {
                          console.log(d, "category discount - autop apply");
                          const findDiscount = updatedDiscountProducts?.find(
                            (dsc) =>
                              dsc?.discount?.promotion_id == d.promotion_id &&
                              dsc?.product_id == prod?.product_id
                          );
                          if (!findDiscount) {
                            updatedDiscountProducts.push({
                              ...prod,
                              count: prod?.count,
                              countDisc: +c?.pcs,
                              discount: { ...d, active: true },
                            });
                            updatedProducts = updatedProducts.filter((upd) => {
                              if (
                                upd?.count == c?.pcs &&
                                upd?.product_id == prod?.product_id
                              ) {
                                return false;
                              }
                              return true;
                            });
                            updatedProducts = updatedProducts.map((upd) => {
                              if (upd?.product_id == prod?.product_id) {
                                return { ...upd, count: upd.count - c?.pcs };
                              }
                              return upd;
                            });
                          }

                          updatedDiscounts = updatedDiscounts.map((ds) => {
                            if (ds.promotion_id == d.promotion_id) {
                              return {
                                ...ds,
                                active: true,
                                end: true,
                                prodCount: 1,
                              };
                            }
                            return ds;
                          });
                        }
                      }
                    }
                    //aniq nechtadir product bo'lganda ishlaydigani va bitta chekda 1 nechta ta aksiya
                    if (params?.accumulation_type == 2) {
                      if (
                        +d.params.conditions_exactly == 1 &&
                        +prod?.count % +c?.pcs == 0
                      ) {
                        if (+d.auto_apply == 0) {
                          const findDiscount = updatedDiscountProducts?.find(
                            (dsc) =>
                              dsc?.discount?.promotion_id == d.promotion_id &&
                              dsc?.product_id == prod?.product_id
                          );
                          console.log({ updatedDiscountProducts });

                          if (!findDiscount) {
                            updatedDiscountProducts.push({
                              ...prod,
                              count: 0,
                              countDisc: +c?.pcs,
                              discount: { ...d, active: false },
                              productCount: prod?.count,
                            });
                            console.log("findDiscount - false - no");
                          } else {
                            console.log("findDiscount - true - no");

                            updatedDiscountProducts =
                              updatedDiscountProducts?.map((dsc) => {
                                if (
                                  dsc?.discount?.promotion_id ==
                                    d?.promotion_id &&
                                  dsc?.product_id == prod?.product_id &&
                                  prod?.count % c?.pcs == 0
                                ) {
                                  return {
                                    ...dsc,
                                    productCount: prod?.count,
                                  };
                                }
                                return dsc;
                              });
                          }
                          updatedDiscounts = updatedDiscounts.map((ds) => {
                            if (ds.promotion_id == d.promotion_id) {
                              return {
                                ...ds,
                                active: true,
                              };
                            }
                            return ds;
                          });
                        }
                        if (+d.auto_apply == 1) {
                          console.log(d, "category discount - autop apply");
                          const findDiscount = updatedDiscountProducts?.find(
                            (dsc) =>
                              dsc?.discount?.promotion_id == d.promotion_id &&
                              dsc?.product_id == prod?.product_id
                          );
                          console.log({ updatedDiscountProducts });

                          if (!findDiscount) {
                            updatedDiscountProducts.push({
                              ...prod,
                              count: prod?.count,
                              countDisc: +c?.pcs,
                              discount: { ...d, active: true },
                            });
                            updatedProducts = updatedProducts.filter((upd) => {
                              if (upd?.product_id == prod?.product_id) {
                                return false;
                              }
                              return true;
                            });
                            console.log("findDiscount - false");
                          } else {
                            console.log("findDiscount - true");

                            updatedDiscountProducts =
                              updatedDiscountProducts?.map((dsc) => {
                                if (
                                  dsc?.discount?.promotion_id ==
                                    d?.promotion_id &&
                                  dsc?.product_id == prod?.product_id
                                ) {
                                  return {
                                    ...dsc,
                                    count: +dsc?.count + +c?.pcs,
                                    countDisc: +dsc?.countDisc + +c?.pcs,
                                    discount: { ...d, active: true },
                                  };
                                }
                                return dsc;
                              });
                            updatedProducts = updatedProducts.filter((upd) => {
                              if (upd?.product_id == prod?.product_id) {
                                return false;
                              }
                              return true;
                            });
                          }

                          updatedDiscounts = updatedDiscounts.map((ds) => {
                            if (ds.promotion_id == d.promotion_id) {
                              return {
                                ...ds,
                                active: true,
                                end: true,
                                prodCount: 1,
                              };
                            }
                            return ds;
                          });
                        }
                      }
                    }
                  });
                  break;
                case 2: // product
                  const findProduct = activeDiscountProducts?.find(
                    (p) => +p.product_id === +c.id
                  );

                  // result_type=1: bonus product - mahsulot shartini bajarsa, bonus mahsulot qo'shiladi
                  if (params?.result_type == 1 && findProduct && +c?.pcs <= findProduct?.count && params?.bonus_products?.length > 0) {
                    const applicationCount =
                      +params?.accumulation_type == 2 &&
                      +params?.conditions_exactly == 1 &&
                      +c?.pcs > 0
                        ? Math.floor((+findProduct?.count || 0) / +c?.pcs)
                        : 1;
                    params.bonus_products.forEach((bp) => {
                      const bonusProductData = allProductsData?.find(
                        (p) => +p.product_id === +bp.id
                      );
                      if (bonusProductData) {
                        const alreadyAdded = updatedDiscountProducts?.find(
                          (dsc) =>
                            dsc?.discount?.promotion_id == d.promotion_id &&
                            dsc?.product_id == bonusProductData.product_id
                        );
                        const isAutoApply = +d.auto_apply == 1;
                        if (!alreadyAdded) {
                          updatedDiscountProducts.push(
                            buildBonusDiscountProduct({
                              bonusProductData,
                              discount: d,
                              isAutoApply,
                              countDisc: +c?.pcs,
                              conditionType: 2,
                              conditionProductId: findProduct?.product_id,
                              resultProductCount:
                                (+params.bonus_products_pcs || 1) *
                                Math.max(1, applicationCount),
                              bonusDiscountPercent:
                                +params.bonus_products_condition_value || 100,
                              promotionTrigger: [
                                {
                                  id: +findProduct?.product_id,
                                  count: +c?.pcs || 1,
                                },
                              ],
                            })
                          );
                        } else {
                          updatedDiscountProducts = updatedDiscountProducts.map((discountProduct) =>
                            discountProduct?.discount?.promotion_id == d.promotion_id &&
                            discountProduct?.product_id == bonusProductData.product_id
                              ? {
                                  ...discountProduct,
                                  count:
                                    (+params.bonus_products_pcs || 1) *
                                    Math.max(1, applicationCount),
                                  resultProductCount:
                                    (+params.bonus_products_pcs || 1) *
                                    Math.max(1, applicationCount),
                                  promotionTrigger: [
                                    {
                                      id: +findProduct?.product_id,
                                      count: +c?.pcs || 1,
                                    },
                                  ],
                                }
                              : discountProduct
                          );
                        }
                        updatedDiscounts = updatedDiscounts.map((ds) => {
                          if (ds.promotion_id == d.promotion_id) {
                            return { ...ds, active: true, end: isAutoApply, prodCount: 1 };
                          }
                          return ds;
                        });
                      }
                    });
                    break;
                  }

                  // result_type=4: fixed price - mahsulot narxi o'zgartiriladi
                  if (params?.result_type == 4 && findProduct && +c?.pcs <= findProduct?.count && params?.discount_prices?.length > 0) {
                    const discountPrice = params.discount_prices.find(
                      (dp) => +dp.id === +findProduct.product_id
                    );
                    if (discountPrice) {
                      const alreadyAdded = updatedDiscountProducts?.find(
                        (dsc) =>
                          dsc?.discount?.promotion_id == d.promotion_id &&
                          dsc?.product_id == findProduct.product_id
                      );
                      if (!alreadyAdded) {
                        const isAutoApply = +d.auto_apply == 1;
                        updatedDiscountProducts.push(
                          buildFixedPriceDiscountProduct({
                            product: findProduct,
                            discount: d,
                            isAutoApply,
                            countDisc: +c?.pcs,
                            fixedPrice: +discountPrice.price / 100,
                            productCount: findProduct?.count,
                            conditionType: 2,
                          })
                        );
                        if (isAutoApply) {
                          updatedProducts = updatedProducts.filter((upd) => {
                            if (upd?.product_id == findProduct?.product_id) {
                              return false;
                            }
                            return true;
                          });
                        }
                        updatedDiscounts = updatedDiscounts.map((ds) => {
                          if (ds.promotion_id == d.promotion_id) {
                            return { ...ds, active: true, end: isAutoApply, prodCount: 1 };
                          }
                          return ds;
                        });
                      }
                    }
                    break;
                  }

                  // kamida qo'shiladigani - no auto apply
                  if (
                    +d.params?.conditions_exactly == 0 &&
                    +c?.pcs <= findProduct?.count &&
                    +d?.auto_apply == 0
                  ) {
                    console.log(d, "category discount");
                    const findDiscount = updatedDiscountProducts?.find(
                      (dsc) =>
                        dsc?.discount?.promotion_id == d.promotion_id &&
                        dsc?.product_id == findProduct?.product_id
                    );
                    if (!findDiscount) {
                      updatedDiscountProducts.push({
                        ...findProduct,
                        count: findProduct?.count,
                        countDisc: +c?.pcs,
                        discount: { ...d, active: false },
                        indexDisc: j + 1,
                      });
                    } else {
                      updatedDiscountProducts = updatedDiscountProducts?.map(
                        (dsc) => {
                          if (
                            dsc?.discount?.promotion_id == d?.promotion_id &&
                            dsc?.product_id == findProduct?.product_id
                          ) {
                            return {
                              ...dsc,
                              count: findProduct?.count,
                              countDisc: findProduct?.count,
                              indexDisc: j + 1,
                            };
                          } else return dsc;
                        }
                      );
                    }

                    updatedDiscounts = updatedDiscounts.map((ds) => {
                      if (ds.promotion_id == d.promotion_id) {
                        return {
                          ...ds,
                          active: true,
                        };
                      }
                      return ds;
                    });
                  }

                  //aniq qo'shiladigan
                  //aniq nechtadir product bo'lganda ishlaydigani va bitta chekda 1 ta aksiya
                  if (params?.accumulation_type == 1) {
                    if (
                      +d.params.conditions_exactly == 1 &&
                      +c?.pcs == findProduct?.count
                    ) {
                      if (+d.auto_apply == 0) {
                        const findDiscount = updatedDiscountProducts?.find(
                          (dsc) =>
                            dsc?.discount?.promotion_id == d.promotion_id &&
                            dsc?.product_id == findProduct?.product_id
                        );
                        if (!findDiscount) {
                          updatedDiscountProducts.push({
                            ...findProduct,
                            count: findProduct?.count,
                            countDisc: +c?.pcs,
                            discount: { ...d, active: false },
                          });
                        }

                        updatedDiscounts = updatedDiscounts.map((ds) => {
                          if (ds.promotion_id == d.promotion_id) {
                            return {
                              ...ds,
                              active: true,
                            };
                          }
                          return ds;
                        });
                      }
                      if (+d.auto_apply == 1) {
                        console.log(d, "category discount - autop apply");
                        const findDiscount = updatedDiscountProducts?.find(
                          (dsc) =>
                            dsc?.discount?.promotion_id == d.promotion_id &&
                            dsc?.product_id == findProduct?.product_id
                        );
                        if (!findDiscount) {
                          updatedDiscountProducts.push({
                            ...findProduct,
                            count: findProduct?.count,
                            countDisc: +c?.pcs,
                            discount: { ...d, active: true },
                          });
                          updatedProducts = updatedProducts.filter((upd) => {
                            if (
                              upd?.count == c?.pcs &&
                              upd?.product_id == findProduct?.product_id
                            ) {
                              return false;
                            }
                            return true;
                          });
                          updatedProducts = updatedProducts.map((upd) => {
                            if (upd?.product_id == findProduct?.product_id) {
                              return { ...upd, count: upd.count - c?.pcs };
                            }
                            return upd;
                          });
                        }

                        updatedDiscounts = updatedDiscounts.map((ds) => {
                          if (ds.promotion_id == d.promotion_id) {
                            return {
                              ...ds,
                              active: true,
                              end: true,
                              prodCount: 1,
                            };
                          }
                          return ds;
                        });
                      }
                    }
                  }
                  //aniq nechtadir product bo'lganda ishlaydigani va bitta chekda 1 nechta ta aksiya
                  if (params?.accumulation_type == 2) {
                    if (
                      +d.params.conditions_exactly == 1 &&
                      +findProduct?.count % +c?.pcs == 0
                    ) {
                      if (+d.auto_apply == 0) {
                        const findDiscount = updatedDiscountProducts?.find(
                          (dsc) =>
                            dsc?.discount?.promotion_id == d.promotion_id &&
                            dsc?.product_id == findProduct.product_id
                        );
                        console.log({ updatedDiscountProducts });

                        if (!findDiscount) {
                          updatedDiscountProducts.push({
                            ...findProduct,
                            count: 0,
                            countDisc: +c?.pcs,
                            productCount: findProduct?.count,
                            discount: { ...d, active: false },
                          });
                          console.log("findDiscount - false - no product");
                        } else {
                          console.log("findDiscount - true - no product");

                          updatedDiscountProducts =
                            updatedDiscountProducts?.map((dsc) => {
                              if (
                                dsc?.discount?.promotion_id ==
                                  d?.promotion_id &&
                                dsc?.product_id == findProduct.product_id &&
                                findProduct?.count % c?.pcs == 0
                              ) {
                                return {
                                  ...dsc,
                                  productCount: findProduct?.count,
                                };
                              }
                              return dsc;
                            });
                        }
                        updatedDiscounts = updatedDiscounts.map((ds) => {
                          if (ds.promotion_id == d.promotion_id) {
                            return {
                              ...ds,
                              active: true,
                            };
                          }
                          return ds;
                        });
                      }
                      if (+d.auto_apply == 1) {
                        console.log(d, "category discount - autop apply");
                        const findDiscount = updatedDiscountProducts?.find(
                          (dsc) =>
                            dsc?.discount?.promotion_id == d.promotion_id &&
                            dsc?.product_id == findProduct?.product_id
                        );
                        console.log({ updatedDiscountProducts });

                        if (!findDiscount) {
                          updatedDiscountProducts.push({
                            ...findProduct,
                            count: findProduct?.count,
                            countDisc: +c?.pcs,
                            discount: { ...d, active: true },
                          });
                          updatedProducts = updatedProducts.filter((upd) => {
                            if (upd?.product_id == findProduct?.product_id) {
                              return false;
                            }
                            return true;
                          });
                          console.log("findDiscount - false");
                        } else {
                          console.log("findDiscount - true");

                          updatedDiscountProducts =
                            updatedDiscountProducts?.map((dsc) => {
                              if (
                                dsc?.discount?.promotion_id ==
                                  d?.promotion_id &&
                                dsc?.product_id == findProduct?.product_id
                              ) {
                                return {
                                  ...dsc,
                                  count: +dsc?.count + +c?.pcs,
                                  countDisc: +dsc?.countDisc + +c?.pcs,
                                  discount: { ...d, active: true },
                                };
                              }
                              return dsc;
                            });
                          updatedProducts = updatedProducts.filter((upd) => {
                            if (upd?.product_id == findProduct?.product_id) {
                              return false;
                            }
                            return true;
                          });
                        }

                        updatedDiscounts = updatedDiscounts.map((ds) => {
                          if (ds.promotion_id == d.promotion_id) {
                            return {
                              ...ds,
                              active: true,
                              end: true,
                              prodCount: 1,
                            };
                          }
                          return ds;
                        });
                      }
                    }
                  }
                  break;
                case 0: // sum-based condition
                  const orderTotal = updatedProducts.reduce((sum, p) => {
                    const price = p?.price?.["1"] ? Number(p.price["1"]) : 0;
                    return sum + price * (p?.count || 1);
                  }, 0);
                  if (c?.sum > 0 && orderTotal >= c.sum) {
                    // result_type=1: bonus product
                    if (params?.result_type == 1 && params?.bonus_products?.length > 0) {
                      params.bonus_products.forEach((bp) => {
                        const bonusProductData = allProductsData?.find(
                          (p) => +p.product_id === +bp.id
                        );
                        if (bonusProductData) {
                          const alreadyAdded = updatedDiscountProducts?.find(
                            (dsc) =>
                              dsc?.discount?.promotion_id == d.promotion_id &&
                              dsc?.product_id == bonusProductData.product_id
                          );
                          if (!alreadyAdded) {
                            const isAutoApply = +d.auto_apply == 1;
                            updatedDiscountProducts.push(
                              buildBonusDiscountProduct({
                                bonusProductData,
                                discount: d,
                                isAutoApply,
                                countDisc: 0,
                                conditionType: 0,
                                resultProductCount:
                                  +params.bonus_products_pcs || 1,
                                bonusDiscountPercent:
                                  +params.bonus_products_condition_value || 100,
                                promotionTrigger:
                                  buildPromotionTriggerSnapshot(updatedProducts),
                              })
                            );
                            updatedDiscounts = updatedDiscounts.map((ds) => {
                              if (ds.promotion_id == d.promotion_id) {
                                return { ...ds, active: true, end: isAutoApply, prodCount: 1 };
                              }
                              return ds;
                            });
                          }
                        }
                      });
                    }
                  }
                  break;
                // case 3: // modifications
                //   handleModificationCondition(d, c, activeDiscountProducts);
                //   break;
                default:
                  console.warn("Unknown condition type:", c.type);
              }
            }
          }
          // if (params?.conditions_rule == "and") {
          //   const conditions = params?.conditions;
          //   let activeConditionProducts = []; // To'g'ri kelgan mahsulotlar uchun bo'sh massiv
          //   let allConditionsMet = true;

          //   for (let i = 0; i < conditions.length; i++) {
          //     const condition = conditions[i];
          //     let conditionMet = false;

          //     switch (condition.type) {
          //       case 1: // category
          //         const filterConditionCategory = activeDiscProducts?.filter(
          //           (pr) => pr?.menu_category_id == condition?.id
          //         );
          //         if (filterConditionCategory?.length > 0) {
          //           conditionMet = true;
          //           // Mos kelgan mahsulotlarni qo'shish
          //           activeConditionProducts = [
          //             ...activeConditionProducts,
          //             ...filterConditionCategory,
          //           ];
          //         }
          //         break;

          //       case 2: // product
          //         const filterConditionProducts = activeDiscProducts?.filter(
          //           (pr) => pr?.product_id == condition?.id
          //         );
          //         if (filterConditionProducts?.length > 0) {
          //           conditionMet = true;
          //           // Mos kelgan mahsulotlarni qo'shish
          //           activeConditionProducts = [
          //             ...activeConditionProducts,
          //             ...filterConditionProducts,
          //           ];
          //         }
          //         break;

          //       case 3: // modifications
          //         const filterConditionModif = activeDiscProducts.filter(
          //           (product) =>
          //             product.modifications.some(
          //               (mod) =>
          //                 product.product_id === condition.product_id &&
          //                 mod.id === condition.id
          //             )
          //         );
          //         if (filterConditionModif?.length > 0) {
          //           conditionMet = true;
          //           // Mos kelgan mahsulotlarni qo'shish
          //           activeConditionProducts = [
          //             ...activeConditionProducts,
          //             ...filterConditionModif,
          //           ];
          //         }
          //         break;

          //       default:
          //         console.warn("Unknown condition type:", condition.type);
          //     }

          //     if (!conditionMet) {
          //       allConditionsMet = false;
          //       break;
          //     }
          //   }

          //   if (allConditionsMet) {
          //     console.log("All conditions met. Discount is active.");
          //     if (d?.auto_apply == 1) {
          //       // Auto apply logic
          //       activeConditionProducts.forEach((pf) =>
          //         setDiscountsProduct(pf, { ...d, active: true })
          //       );
          //     } else {
          //       // Manual apply logic
          //       activeConditionProducts.forEach((pf) =>
          //         setDiscountsProduct(pf, { ...d, active: false })
          //       );
          //     }
          //     setActiveDiscount(d.promotion_id, true);
          //   } else {
          //     console.log("Conditions not met. Discount is inactive.");
          //     setActiveDiscount(d.promotion_id, false);
          //   }
          //   console.log(
          //     "Active Modification Products:",
          //     activeConditionProducts
          //   );
          // }
          // const findDiscInProd = updatedProducts.filter((prod) =>
          //   prod?.discounts?.find((ds) => ds.promotion_id == ds.promotion_id)
          // );

          // console.log(findDiscInProd, "findDiscInProd");
          // if (findDiscInProd.length == 0) {
          //   updatedDiscounts = updatedDiscounts.map((dss) => {
          //     if (dss?.promotion_id == d?.promotion_id) {
          //       return {
          //         ...dss,
          //         active: false,
          //         end: false,
          //       };
          //     } else return dss;
          //   });
          // }
          localStorage.setItem(
            "discountProducts",
            JSON.stringify(updatedDiscountProducts)
          );
        }

        localStorage.setItem("products", JSON.stringify(updatedProducts));
        localStorage.setItem("discounts", JSON.stringify(updatedDiscounts));
        return { products: updatedProducts, discountProducts: updatedDiscountProducts, discounts: updatedDiscounts };
      }

      localStorage.setItem("products", JSON.stringify(updatedProducts));
      return { products: updatedProducts };
    }),
  setDiscounts: (data) =>
    set((state) => {
      state.initializeDiscounts();
      localStorage.setItem("discounts", JSON.stringify(data));
      return { discounts: data };
    }),
  setActiveDiscount: (id, active, products) =>
    set((state) => {
      state.initializeDiscounts();
      console.log("active:", id, active);

      const updatedDiscounts = state.discounts.map((discount) => {
        if (+discount.promotion_id === +id) {
          let lastProducts = [];
          if (discount?.products) {
            lastProducts = [...discount?.products, ...products];
          } else {
            lastProducts = products;
          }
          return {
            ...discount,
            active,
            products: lastProducts,
          };
        } else {
          return discount;
        }
      });
      localStorage.setItem("discounts", JSON.stringify(updatedDiscounts));
      return { discounts: updatedDiscounts };
    }),
  setDiscountsProduct: (product, discount) => {
    set((state) => {
      let updatedDiscountProducts = [...state.discountProducts];
      if (product && discount) {
        const existingProduct = state.discountProducts.find(
          (c) => +c.product_id == +product?.product_id
        );
        if (!existingProduct) {
          updatedDiscountProducts = [
            ...state.discountProducts,
            { ...product, discount },
          ];
        } else {
          updatedDiscountProducts = updatedDiscountProducts.map((p) =>
            +p?.product_id == +product.product_id
              ? {
                  ...product,
                  discount,
                }
              : p
          );
        }

        localStorage.setItem(
          "discountProducts",
          JSON.stringify(updatedDiscountProducts)
        );
        return { discountProducts: updatedDiscountProducts };
      } else {
        localStorage.setItem("discountProducts", JSON.stringify([]));
        return { discountProducts: [] };
      }
    });
  },
  plusDiscount: (discount) => {
    set((state) => {
      state.initializeDiscountProducts();
      let updateDiscount = state.discountProducts;
      updateDiscount = updateDiscount
        .map((p) => {
          if (
            p?.product_id == discount.product_id &&
            discount?.discount?.promotion_id == p?.discount?.promotion_id
          ) {
            return { ...p, count: p.count + 1 };
          } else return p;
        })
        .filter((p) => p.count > 0);
      localStorage.setItem("discountProducts", JSON.stringify(updateDiscount));
      return { discountProducts: updateDiscount ?? [] };
    });
  },
  minusDiscount: (discount) => {
    console.log(discount, "minus discount");

    set((state) => {
      state.initializeDiscountProducts();
      let updateDiscount = state.discountProducts;
      updateDiscount = updateDiscount
        .map((p) => {
          if (
            p?.product_id == discount.product_id &&
            discount?.discount?.promotion_id == p?.discount?.promotion_id
          ) {
            return { ...p, count: p.count - 1 };
          } else {
            return p;
          }
        })
        .filter((p) => p.count > 0);
      localStorage.setItem("discountProducts", JSON.stringify(updateDiscount));
      return { discountProducts: updateDiscount ?? [] };
    });
  },
  incrementCount: (
    product_id,
    modif_id,
    noDiscountProducts,
    noDisccountCategories
  ) =>
    set((state) => {
      if (product_id && !modif_id) {
        let updatedDiscountProducts = [...state.discountProducts];
        let updatedProducts = state.products.map((product) =>
          product.product_id === product_id
            ? { ...product, count: product.count + 1 }
            : product
        );

        //discount active products
        const activeDiscountProducts = updatedProducts.filter((p) => {
          const activeDiscountPr = noDiscountProducts.find(
            (ndp) => ndp?.product_id == p?.product_id
          );
          const activeDiscountCt = noDisccountCategories?.find(
            (ndc) => ndc?.category_id == p?.menu_category_id
          );

          if (activeDiscountCt || activeDiscountPr) {
            return false;
          } else {
            return true;
          }
        });
        //canculate discount
        if (activeDiscountProducts?.length > 0) {
          let updatedDiscounts = [...state.discounts];

          for (let i = 0; i < state?.discounts.length; i++) {
            const d = state?.discounts[i];
            const params = d?.params;
            if (params?.conditions_rule == "or") {
              for (let j = 0; j < params?.conditions.length; j++) {
                const c = params?.conditions[j];
                switch (c.type) {
                  case 1: // category
                    let filterProductsCategory;
                    filterProductsCategory = activeDiscountProducts.filter(
                      (p) => p?.menu_category_id == c?.id
                    );
                    filterProductsCategory?.map((prod) => {
                      // kamida qo'shiladigani - no auto apply
                      if (
                        +d.params?.conditions_exactly == 0 &&
                        +c?.pcs <= prod?.count &&
                        +d?.auto_apply == 0
                      ) {
                        console.log(d, "category discount");
                        const findDiscount = updatedDiscountProducts?.find(
                          (dsc) =>
                            dsc?.discount?.promotion_id == d.promotion_id &&
                            dsc?.product_id == prod?.product_id
                        );
                        if (!findDiscount) {
                          updatedDiscountProducts.push({
                            ...prod,
                            count: prod?.count,
                            countDisc: +c?.pcs,
                            discount: { ...d, active: false },
                          });
                        }
                        updatedDiscounts = updatedDiscounts.map((ds) => {
                          if (ds.promotion_id == d.promotion_id) {
                            return {
                              ...ds,
                              active: true,
                            };
                          }
                          return ds;
                        });
                      }
                      //aniq qo'shiladigan
                      //aniq nechtadir product bo'lganda ishlaydigani va bitta chekda 1 ta aksiya
                      if (params?.accumulation_type == 1) {
                        if (
                          +d.params.conditions_exactly == 1 &&
                          +c?.pcs == prod?.count
                        ) {
                          if (+d.auto_apply == 0) {
                            const findDiscount = updatedDiscountProducts?.find(
                              (dsc) =>
                                dsc?.discount?.promotion_id == d.promotion_id &&
                                dsc?.product_id == prod?.product_id
                            );
                            if (!findDiscount) {
                              updatedDiscountProducts.push({
                                ...prod,
                                count: prod?.count,
                                countDisc: +c?.pcs,
                                discount: { ...d, active: false },
                              });
                            }

                            updatedDiscounts = updatedDiscounts.map((ds) => {
                              if (ds.promotion_id == d.promotion_id) {
                                return {
                                  ...ds,
                                  active: true,
                                };
                              }
                              return ds;
                            });
                          }
                          if (+d.auto_apply == 1) {
                            console.log(d, "category discount - autop apply");
                            const findDiscount = updatedDiscountProducts?.find(
                              (dsc) =>
                                dsc?.discount?.promotion_id == d.promotion_id &&
                                dsc?.product_id == prod?.product_id
                            );
                            if (!findDiscount) {
                              updatedDiscountProducts.push({
                                ...prod,
                                count: prod?.count,
                                countDisc: +c?.pcs,
                                discount: { ...d, active: true },
                              });
                              updatedProducts = updatedProducts.filter(
                                (upd) => {
                                  if (
                                    upd?.count == c?.pcs &&
                                    upd?.product_id == prod?.product_id
                                  ) {
                                    return false;
                                  }
                                  return true;
                                }
                              );
                              updatedProducts = updatedProducts.map((upd) => {
                                if (upd?.product_id == prod?.product_id) {
                                  return { ...upd, count: upd.count - c?.pcs };
                                }
                                return upd;
                              });
                            }

                            updatedDiscounts = updatedDiscounts.map((ds) => {
                              if (ds.promotion_id == d.promotion_id) {
                                return {
                                  ...ds,
                                  active: true,
                                  end: true,
                                  prodCount: 1,
                                };
                              }
                              return ds;
                            });
                          }
                        }
                      }
                      //aniq nechtadir product bo'lganda ishlaydigani va bitta chekda 1 nechta ta aksiya
                      if (params?.accumulation_type == 2) {
                        if (
                          +d.params.conditions_exactly == 1 &&
                          +prod?.count % +c?.pcs == 0
                        ) {
                          if (+d.auto_apply == 0) {
                            const findDiscount = updatedDiscountProducts?.find(
                              (dsc) =>
                                dsc?.discount?.promotion_id == d.promotion_id &&
                                dsc?.product_id == prod?.product_id
                            );
                            console.log({ updatedDiscountProducts });

                            if (!findDiscount) {
                              updatedDiscountProducts.push({
                                ...prod,
                                count: 0,
                                countDisc: +c?.pcs,
                                productCount: prod?.count,
                                discount: { ...d, active: false },
                              });
                              console.log("findDiscount - false - no");
                            } else {
                              console.log("findDiscount - true - no");

                              updatedDiscountProducts =
                                updatedDiscountProducts?.map((dsc) => {
                                  if (
                                    dsc?.discount?.promotion_id ==
                                      d?.promotion_id &&
                                    dsc?.product_id == prod?.product_id &&
                                    prod?.count % c?.pcs == 0
                                  ) {
                                    return {
                                      ...dsc,
                                      productCount: prod?.count,
                                    };
                                  }
                                  return dsc;
                                });
                            }
                            updatedDiscounts = updatedDiscounts.map((ds) => {
                              if (ds.promotion_id == d.promotion_id) {
                                return {
                                  ...ds,
                                  active: true,
                                };
                              }
                              return ds;
                            });
                          }
                          if (+d.auto_apply == 1) {
                            console.log(d, "category discount - autop apply");
                            const findDiscount = updatedDiscountProducts?.find(
                              (dsc) =>
                                dsc?.discount?.promotion_id == d.promotion_id &&
                                dsc?.product_id == prod?.product_id
                            );
                            console.log({ updatedDiscountProducts });

                            if (!findDiscount) {
                              updatedDiscountProducts.push({
                                ...prod,
                                count: prod?.count,
                                countDisc: +c?.pcs,
                                discount: { ...d, active: true },
                              });
                              updatedProducts = updatedProducts.filter(
                                (upd) => {
                                  if (upd?.product_id == prod?.product_id) {
                                    return false;
                                  }
                                  return true;
                                }
                              );
                              console.log("findDiscount - false");
                            } else {
                              console.log("findDiscount - true");

                              updatedDiscountProducts =
                                updatedDiscountProducts?.map((dsc) => {
                                  if (
                                    dsc?.discount?.promotion_id ==
                                      d?.promotion_id &&
                                    dsc?.product_id == prod?.product_id
                                  ) {
                                    return {
                                      ...dsc,
                                      count: +dsc?.count + +c?.pcs,
                                      countDisc: +dsc?.countDisc + +c?.pcs,
                                      discount: { ...d, active: true },
                                    };
                                  }
                                  return dsc;
                                });
                              updatedProducts = updatedProducts.filter(
                                (upd) => {
                                  if (upd?.product_id == prod?.product_id) {
                                    return false;
                                  }
                                  return true;
                                }
                              );
                            }

                            updatedDiscounts = updatedDiscounts.map((ds) => {
                              if (ds.promotion_id == d.promotion_id) {
                                return {
                                  ...ds,
                                  active: true,
                                  end: true,
                                  prodCount: 1,
                                };
                              }
                              return ds;
                            });
                          }
                        }
                      }
                    });
                    break;
                  case 2: // product
                    const findProduct = activeDiscountProducts?.find(
                      (p) => +p.product_id === +c.id
                    );

                    // kamida qo'shiladigani - no auto apply
                    if (
                      +d.params?.conditions_exactly == 0 &&
                      +c?.pcs <= findProduct?.count &&
                      +d?.auto_apply == 0
                    ) {
                      console.log(d, "category discount");
                      const findDiscount = updatedDiscountProducts?.find(
                        (dsc) =>
                          dsc?.discount?.promotion_id == d.promotion_id &&
                          dsc?.product_id == findProduct?.product_id
                      );
                      if (!findDiscount) {
                        updatedDiscountProducts.push({
                          ...findProduct,
                          count: findProduct?.count,
                          countDisc: +c?.pcs,
                          discount: { ...d, active: false },
                        });
                      }
                      updatedDiscounts = updatedDiscounts.map((ds) => {
                        if (ds.promotion_id == d.promotion_id) {
                          return {
                            ...ds,
                            active: true,
                          };
                        }
                        return ds;
                      });
                    }
                    //aniq qo'shiladigan
                    //aniq nechtadir product bo'lganda ishlaydigani va bitta chekda 1 ta aksiya
                    if (params?.accumulation_type == 1) {
                      if (
                        +d.params.conditions_exactly == 1 &&
                        +c?.pcs == findProduct?.count
                      ) {
                        if (+d.auto_apply == 0) {
                          const findDiscount = updatedDiscountProducts?.find(
                            (dsc) =>
                              dsc?.discount?.promotion_id == d.promotion_id &&
                              dsc?.product_id == findProduct?.product_id
                          );
                          if (!findDiscount) {
                            updatedDiscountProducts.push({
                              ...findProduct,
                              count: findProduct?.count,
                              countDisc: +c?.pcs,
                              discount: { ...d, active: false },
                            });
                          }

                          updatedDiscounts = updatedDiscounts.map((ds) => {
                            if (ds.promotion_id == d.promotion_id) {
                              return {
                                ...ds,
                                active: true,
                              };
                            }
                            return ds;
                          });
                        }
                        if (+d.auto_apply == 1) {
                          console.log(d, "category discount - autop apply");
                          const findDiscount = updatedDiscountProducts?.find(
                            (dsc) =>
                              dsc?.discount?.promotion_id == d.promotion_id &&
                              dsc?.product_id == findProduct?.product_id
                          );
                          if (!findDiscount) {
                            updatedDiscountProducts.push({
                              ...findProduct,
                              count: findProduct?.count,
                              countDisc: +c?.pcs,
                              discount: { ...d, active: true },
                            });
                            updatedProducts = updatedProducts.filter((upd) => {
                              if (
                                upd?.count == c?.pcs &&
                                upd?.product_id == findProduct?.product_id
                              ) {
                                return false;
                              }
                              return true;
                            });
                            updatedProducts = updatedProducts.map((upd) => {
                              if (upd?.product_id == findProduct?.product_id) {
                                return { ...upd, count: upd.count - c?.pcs };
                              }
                              return upd;
                            });
                          }

                          updatedDiscounts = updatedDiscounts.map((ds) => {
                            if (ds.promotion_id == d.promotion_id) {
                              return {
                                ...ds,
                                active: true,
                                end: true,
                                prodCount: 1,
                              };
                            }
                            return ds;
                          });
                        }
                      }
                    }
                    //aniq nechtadir product bo'lganda ishlaydigani va bitta chekda 1 nechta ta aksiya
                    if (params?.accumulation_type == 2) {
                      if (
                        +d.params.conditions_exactly == 1 &&
                        +findProduct?.count % +c?.pcs == 0
                      ) {
                        if (+d.auto_apply == 0) {
                          const findDiscount = updatedDiscountProducts?.find(
                            (dsc) =>
                              dsc?.discount?.promotion_id == d.promotion_id &&
                              dsc?.product_id == findProduct.product_id
                          );
                          console.log({ updatedDiscountProducts });

                          if (!findDiscount) {
                            updatedDiscountProducts.push({
                              ...findProduct,
                              count: 0,
                              productCount: findProduct?.count,
                              countDisc: +c?.pcs,
                              discount: { ...d, active: false },
                            });
                            console.log("findDiscount - false - no");
                          } else {
                            console.log("findDiscount - true - no");

                            updatedDiscountProducts =
                              updatedDiscountProducts?.map((dsc) => {
                                if (
                                  dsc?.discount?.promotion_id ==
                                    d?.promotion_id &&
                                  dsc?.product_id == findProduct.product_id &&
                                  findProduct?.count % c?.pcs == 0
                                ) {
                                  return {
                                    ...dsc,
                                    productCount: findProduct?.count,
                                  };
                                }
                                return dsc;
                              });
                          }
                          updatedDiscounts = updatedDiscounts.map((ds) => {
                            if (ds.promotion_id == d.promotion_id) {
                              return {
                                ...ds,
                                active: true,
                              };
                            }
                            return ds;
                          });
                        }
                        if (+d.auto_apply == 1) {
                          console.log(d, "category discount - autop apply");
                          const findDiscount = updatedDiscountProducts?.find(
                            (dsc) =>
                              dsc?.discount?.promotion_id == d.promotion_id &&
                              dsc?.product_id == findProduct?.product_id
                          );
                          console.log({ updatedDiscountProducts });

                          if (!findDiscount) {
                            updatedDiscountProducts.push({
                              ...findProduct,
                              count: findProduct?.count,
                              countDisc: +c?.pcs,
                              discount: { ...d, active: true },
                            });
                            updatedProducts = updatedProducts.filter((upd) => {
                              if (upd?.product_id == findProduct?.product_id) {
                                return false;
                              }
                              return true;
                            });
                            console.log("findDiscount - false");
                          } else {
                            console.log("findDiscount - true");

                            updatedDiscountProducts =
                              updatedDiscountProducts?.map((dsc) => {
                                if (
                                  dsc?.discount?.promotion_id ==
                                    d?.promotion_id &&
                                  dsc?.product_id == findProduct?.product_id
                                ) {
                                  return {
                                    ...dsc,
                                    count: +dsc?.count + +c?.pcs,
                                    countDisc: +dsc?.countDisc + +c?.pcs,
                                    discount: { ...d, active: true },
                                  };
                                }
                                return dsc;
                              });
                            updatedProducts = updatedProducts.filter((upd) => {
                              if (upd?.product_id == findProduct?.product_id) {
                                return false;
                              }
                              return true;
                            });
                          }

                          updatedDiscounts = updatedDiscounts.map((ds) => {
                            if (ds.promotion_id == d.promotion_id) {
                              return {
                                ...ds,
                                active: true,
                                end: true,
                                prodCount: 1,
                              };
                            }
                            return ds;
                          });
                        }
                      }
                    }
                    break;
                  // case 3: // modifications
                  //   handleModificationCondition(d, c, activeDiscountProducts);
                  //   break;
                  default:
                    console.warn("Unknown condition type:", c.type);
                }
              }
            }
            // if (params?.conditions_rule == "and") {
            //   const conditions = params?.conditions;
            //   let activeConditionProducts = []; // To'g'ri kelgan mahsulotlar uchun bo'sh massiv
            //   let allConditionsMet = true;

            //   for (let i = 0; i < conditions.length; i++) {
            //     const condition = conditions[i];
            //     let conditionMet = false;

            //     switch (condition.type) {
            //       case 1: // category
            //         const filterConditionCategory = activeDiscProducts?.filter(
            //           (pr) => pr?.menu_category_id == condition?.id
            //         );
            //         if (filterConditionCategory?.length > 0) {
            //           conditionMet = true;
            //           // Mos kelgan mahsulotlarni qo'shish
            //           activeConditionProducts = [
            //             ...activeConditionProducts,
            //             ...filterConditionCategory,
            //           ];
            //         }
            //         break;

            //       case 2: // product
            //         const filterConditionProducts = activeDiscProducts?.filter(
            //           (pr) => pr?.product_id == condition?.id
            //         );
            //         if (filterConditionProducts?.length > 0) {
            //           conditionMet = true;
            //           // Mos kelgan mahsulotlarni qo'shish
            //           activeConditionProducts = [
            //             ...activeConditionProducts,
            //             ...filterConditionProducts,
            //           ];
            //         }
            //         break;

            //       case 3: // modifications
            //         const filterConditionModif = activeDiscProducts.filter(
            //           (product) =>
            //             product.modifications.some(
            //               (mod) =>
            //                 product.product_id === condition.product_id &&
            //                 mod.id === condition.id
            //             )
            //         );
            //         if (filterConditionModif?.length > 0) {
            //           conditionMet = true;
            //           // Mos kelgan mahsulotlarni qo'shish
            //           activeConditionProducts = [
            //             ...activeConditionProducts,
            //             ...filterConditionModif,
            //           ];
            //         }
            //         break;

            //       default:
            //         console.warn("Unknown condition type:", condition.type);
            //     }

            //     if (!conditionMet) {
            //       allConditionsMet = false;
            //       break;
            //     }
            //   }

            //   if (allConditionsMet) {
            //     console.log("All conditions met. Discount is active.");
            //     if (d?.auto_apply == 1) {
            //       // Auto apply logic
            //       activeConditionProducts.forEach((pf) =>
            //         setDiscountsProduct(pf, { ...d, active: true })
            //       );
            //     } else {
            //       // Manual apply logic
            //       activeConditionProducts.forEach((pf) =>
            //         setDiscountsProduct(pf, { ...d, active: false })
            //       );
            //     }
            //     setActiveDiscount(d.promotion_id, true);
            //   } else {
            //     console.log("Conditions not met. Discount is inactive.");
            //     setActiveDiscount(d.promotion_id, false);
            //   }
            //   console.log(
            //     "Active Modification Products:",
            //     activeConditionProducts
            //   );
            // }
            // const findDiscInProd = updatedProducts.filter((prod) =>
            //   prod?.discounts?.find((ds) => ds.promotion_id == ds.promotion_id)
            // );

            // console.log(findDiscInProd, "findDiscInProd");
            // if (findDiscInProd.length == 0) {
            //   updatedDiscounts = updatedDiscounts.map((dss) => {
            //     if (dss?.promotion_id == d?.promotion_id) {
            //       return {
            //         ...dss,
            //         active: false,
            //         end: false,
            //       };
            //     } else return dss;
            //   });
            // }
            localStorage.setItem(
              "discountProducts",
              JSON.stringify(updatedDiscountProducts)
            );
          }

          localStorage.setItem("products", JSON.stringify(updatedProducts));
          localStorage.setItem("discounts", JSON.stringify(updatedDiscounts));
          return { products: updatedProducts, discountProducts: updatedDiscountProducts, discounts: updatedDiscounts };
        }

        localStorage.setItem("products", JSON.stringify(updatedProducts));
        return { products: updatedProducts };
      }
      if (product_id && modif_id) {
        const findProduct = state.products.find(
          (p) => p.product_id === product_id
        );
        if (findProduct) {
          const findModificator = findProduct.modifications.find(
            (mod) => mod.modificator_id === modif_id
          );
          if (findModificator) {
            const updatedModifications = findProduct.modifications.map((mod) =>
              mod.modificator_id === modif_id
                ? { ...mod, count: mod.count + 1 }
                : mod
            );
            localStorage.setItem(
              "products",
              JSON.stringify(
                state.products.map((p) =>
                  p.product_id === product_id
                    ? { ...p, modifications: updatedModifications }
                    : p
                )
              )
            );
            return {
              products: state.products.map((p) =>
                p.product_id === product_id
                  ? { ...p, modifications: updatedModifications }
                  : p
              ),
            };
          }
        }
      }
    }),
  decrementCount: (
    product_id,
    modif_id,
    noDiscountProducts,
    noDisccountCategories
  ) =>
    set((state) => {
      if (product_id && !modif_id) {
        let updatedDiscountProducts = [...state.discountProducts];
        let updatedProducts = state.products
          .map((product) =>
            product?.product_id === product_id && product.count > 0
              ? { ...product, count: product.count - 1 }
              : product
          )
          .filter((product) => product?.count > 0);

        //discount active products
        const activeDiscountProducts = updatedProducts.filter((p) => {
          const activeDiscountPr = noDiscountProducts.find(
            (ndp) => ndp?.product_id == p?.product_id
          );
          const activeDiscountCt = noDisccountCategories?.find(
            (ndc) => ndc?.category_id == p?.menu_category_id
          );

          if (activeDiscountCt || activeDiscountPr) {
            return false;
          } else {
            return true;
          }
        });
        //canculate discount
        if (activeDiscountProducts?.length > 0) {
          let updatedDiscounts = [...state.discounts];

          for (let i = 0; i < state?.discounts.length; i++) {
            const d = state?.discounts[i];
            const params = d?.params;
            if (params?.conditions_rule == "or") {
              for (let j = 0; j < params?.conditions.length; j++) {
                const c = params?.conditions[j];
                switch (c.type) {
                  case 1: // category
                    let filterProductsCategory;
                    filterProductsCategory = activeDiscountProducts.filter(
                      (p) => p?.menu_category_id == c?.id
                    );
                    filterProductsCategory?.map((prod) => {
                      // kamida qo'shiladigani - no auto apply
                      if (
                        +d.params?.conditions_exactly == 0 &&
                        +c?.pcs <= prod?.count &&
                        +d?.auto_apply == 0
                      ) {
                        console.log(d, "category discount");
                        const findDiscount = updatedDiscountProducts?.find(
                          (dsc) =>
                            dsc?.discount?.promotion_id == d.promotion_id &&
                            dsc?.product_id == prod?.product_id
                        );
                        if (!findDiscount) {
                          updatedDiscountProducts.push({
                            ...prod,
                            count: prod?.count,
                            countDisc: +c?.pcs,
                            discount: { ...d, active: false },
                          });
                        }
                        updatedDiscounts = updatedDiscounts.map((ds) => {
                          if (ds.promotion_id == d.promotion_id) {
                            return {
                              ...ds,
                              active: true,
                            };
                          }
                          return ds;
                        });
                      }
                      //aniq qo'shiladigan
                      //aniq nechtadir product bo'lganda ishlaydigani va bitta chekda 1 ta aksiya
                      if (params?.accumulation_type == 1) {
                        if (
                          +d.params.conditions_exactly == 1 &&
                          +c?.pcs == prod?.count
                        ) {
                          if (+d.auto_apply == 0) {
                            const findDiscount = updatedDiscountProducts?.find(
                              (dsc) =>
                                dsc?.discount?.promotion_id == d.promotion_id &&
                                dsc?.product_id == prod?.product_id
                            );
                            if (!findDiscount) {
                              updatedDiscountProducts.push({
                                ...prod,
                                count: prod?.count,
                                countDisc: +c?.pcs,
                                discount: { ...d, active: false },
                              });
                            }

                            updatedDiscounts = updatedDiscounts.map((ds) => {
                              if (ds.promotion_id == d.promotion_id) {
                                return {
                                  ...ds,
                                  active: true,
                                };
                              }
                              return ds;
                            });
                          }
                          if (+d.auto_apply == 1) {
                            console.log(d, "category discount - autop apply");
                            const findDiscount = updatedDiscountProducts?.find(
                              (dsc) =>
                                dsc?.discount?.promotion_id == d.promotion_id &&
                                dsc?.product_id == prod?.product_id
                            );
                            if (!findDiscount) {
                              updatedDiscountProducts.push({
                                ...prod,
                                count: prod?.count,
                                countDisc: +c?.pcs,
                                discount: { ...d, active: true },
                              });
                              updatedProducts = updatedProducts.filter(
                                (upd) => {
                                  if (
                                    upd?.count == c?.pcs &&
                                    upd?.product_id == prod?.product_id
                                  ) {
                                    return false;
                                  }
                                  return true;
                                }
                              );
                              updatedProducts = updatedProducts.map((upd) => {
                                if (upd?.product_id == prod?.product_id) {
                                  return { ...upd, count: upd.count - c?.pcs };
                                }
                                return upd;
                              });
                            }

                            updatedDiscounts = updatedDiscounts.map((ds) => {
                              if (ds.promotion_id == d.promotion_id) {
                                return {
                                  ...ds,
                                  active: true,
                                  end: true,
                                  prodCount: 1,
                                };
                              }
                              return ds;
                            });
                          }
                        }
                      }
                      //aniq nechtadir product bo'lganda ishlaydigani va bitta chekda 1 nechta ta aksiya
                      if (params?.accumulation_type == 2) {
                        if (
                          +d.params.conditions_exactly == 1 &&
                          +prod?.count % +c?.pcs == 0
                        ) {
                          if (+d.auto_apply == 0) {
                            const findDiscount = updatedDiscountProducts?.find(
                              (dsc) =>
                                dsc?.discount?.promotion_id == d.promotion_id &&
                                dsc?.product_id == prod?.product_id
                            );
                            console.log({ updatedDiscountProducts });

                            if (!findDiscount) {
                              updatedDiscountProducts.push({
                                ...prod,
                                count: 0,
                                productCount: prod?.count,
                                countDisc: +c?.pcs,
                                discount: { ...d, active: false },
                              });
                              console.log("findDiscount - false - no");
                            } else {
                              console.log("findDiscount - true - no");

                              updatedDiscountProducts =
                                updatedDiscountProducts?.map((dsc) => {
                                  if (
                                    dsc?.discount?.promotion_id ==
                                      d?.promotion_id &&
                                    dsc?.product_id == prod?.product_id &&
                                    prod?.count % c?.pcs == 0
                                  ) {
                                    return {
                                      ...dsc,
                                      productCount: prod?.count,
                                    };
                                  }
                                  return dsc;
                                });
                            }
                            updatedDiscounts = updatedDiscounts.map((ds) => {
                              if (ds.promotion_id == d.promotion_id) {
                                return {
                                  ...ds,
                                  active: true,
                                };
                              }
                              return ds;
                            });
                          }
                          if (+d.auto_apply == 1) {
                            console.log(d, "category discount - autop apply");
                            const findDiscount = updatedDiscountProducts?.find(
                              (dsc) =>
                                dsc?.discount?.promotion_id == d.promotion_id &&
                                dsc?.product_id == prod?.product_id
                            );
                            console.log({ updatedDiscountProducts });

                            if (!findDiscount) {
                              updatedDiscountProducts.push({
                                ...prod,
                                count: prod?.count,
                                countDisc: +c?.pcs,
                                discount: { ...d, active: true },
                              });
                              updatedProducts = updatedProducts.filter(
                                (upd) => {
                                  if (upd?.product_id == prod?.product_id) {
                                    return false;
                                  }
                                  return true;
                                }
                              );
                              console.log("findDiscount - false");
                            } else {
                              console.log("findDiscount - true");

                              updatedDiscountProducts =
                                updatedDiscountProducts?.map((dsc) => {
                                  if (
                                    dsc?.discount?.promotion_id ==
                                      d?.promotion_id &&
                                    dsc?.product_id == prod?.product_id
                                  ) {
                                    return {
                                      ...dsc,
                                      count: +dsc?.count + +c?.pcs,
                                      countDisc: +dsc?.countDisc + +c?.pcs,
                                      discount: { ...d, active: true },
                                    };
                                  }
                                  return dsc;
                                });
                              updatedProducts = updatedProducts.filter(
                                (upd) => {
                                  if (upd?.product_id == prod?.product_id) {
                                    return false;
                                  }
                                  return true;
                                }
                              );
                            }

                            updatedDiscounts = updatedDiscounts.map((ds) => {
                              if (ds.promotion_id == d.promotion_id) {
                                return {
                                  ...ds,
                                  active: true,
                                  end: true,
                                  prodCount: 1,
                                };
                              }
                              return ds;
                            });
                          }
                        }
                      }
                    });
                    break;
                  case 2: // product
                    const findProduct = activeDiscountProducts?.find(
                      (p) => +p.product_id === +c.id
                    );

                    // kamida qo'shiladigani - no auto apply
                    if (
                      +d.params?.conditions_exactly == 0 &&
                      +c?.pcs <= findProduct?.count &&
                      +d?.auto_apply == 0
                    ) {
                      console.log(d, "category discount");
                      const findDiscount = updatedDiscountProducts?.find(
                        (dsc) =>
                          dsc?.discount?.promotion_id == d.promotion_id &&
                          dsc?.product_id == findProduct?.product_id
                      );
                      if (!findDiscount) {
                        updatedDiscountProducts.push({
                          ...findProduct,
                          count: findProduct?.count,
                          countDisc: +c?.pcs,
                          discount: { ...d, active: false },
                        });
                      }
                      updatedDiscounts = updatedDiscounts.map((ds) => {
                        if (ds.promotion_id == d.promotion_id) {
                          return {
                            ...ds,
                            active: true,
                          };
                        }
                        return ds;
                      });
                    }
                    //aniq qo'shiladigan
                    //aniq nechtadir product bo'lganda ishlaydigani va bitta chekda 1 ta aksiya
                    if (params?.accumulation_type == 1) {
                      if (
                        +d.params.conditions_exactly == 1 &&
                        +c?.pcs == findProduct?.count
                      ) {
                        if (+d.auto_apply == 0) {
                          const findDiscount = updatedDiscountProducts?.find(
                            (dsc) =>
                              dsc?.discount?.promotion_id == d.promotion_id &&
                              dsc?.product_id == findProduct?.product_id
                          );
                          if (!findDiscount) {
                            updatedDiscountProducts.push({
                              ...findProduct,
                              count: findProduct?.count,
                              countDisc: +c?.pcs,
                              discount: { ...d, active: false },
                            });
                          }

                          updatedDiscounts = updatedDiscounts.map((ds) => {
                            if (ds.promotion_id == d.promotion_id) {
                              return {
                                ...ds,
                                active: true,
                              };
                            }
                            return ds;
                          });
                        }
                        if (+d.auto_apply == 1) {
                          console.log(d, "category discount - autop apply");
                          const findDiscount = updatedDiscountProducts?.find(
                            (dsc) =>
                              dsc?.discount?.promotion_id == d.promotion_id &&
                              dsc?.product_id == findProduct?.product_id
                          );
                          if (!findDiscount) {
                            updatedDiscountProducts.push({
                              ...findProduct,
                              count: findProduct?.count,
                              countDisc: +c?.pcs,
                              discount: { ...d, active: true },
                            });
                            updatedProducts = updatedProducts.filter((upd) => {
                              if (
                                upd?.count == c?.pcs &&
                                upd?.product_id == findProduct?.product_id
                              ) {
                                return false;
                              }
                              return true;
                            });
                            updatedProducts = updatedProducts.map((upd) => {
                              if (upd?.product_id == findProduct?.product_id) {
                                return { ...upd, count: upd.count - c?.pcs };
                              }
                              return upd;
                            });
                          }

                          updatedDiscounts = updatedDiscounts.map((ds) => {
                            if (ds.promotion_id == d.promotion_id) {
                              return {
                                ...ds,
                                active: true,
                                end: true,
                                prodCount: 1,
                              };
                            }
                            return ds;
                          });
                        }
                      }
                    }
                    //aniq nechtadir product bo'lganda ishlaydigani va bitta chekda 1 nechta ta aksiya
                    if (params?.accumulation_type == 2) {
                      if (
                        +d.params.conditions_exactly == 1 &&
                        +findProduct?.count % +c?.pcs == 0
                      ) {
                        if (+d.auto_apply == 0) {
                          const findDiscount = updatedDiscountProducts?.find(
                            (dsc) =>
                              dsc?.discount?.promotion_id == d.promotion_id &&
                              dsc?.product_id == findProduct.product_id
                          );
                          console.log({ updatedDiscountProducts });

                          if (!findDiscount) {
                            updatedDiscountProducts.push({
                              ...findProduct,
                              count: 0,
                              countDisc: +c?.pcs,
                              productCount: findProduct?.count,
                              discount: { ...d, active: false },
                            });
                            console.log("findDiscount - false - no");
                          } else {
                            console.log("findDiscount - true - no");

                            updatedDiscountProducts =
                              updatedDiscountProducts?.map((dsc) => {
                                if (
                                  dsc?.discount?.promotion_id ==
                                    d?.promotion_id &&
                                  dsc?.product_id == findProduct.product_id &&
                                  findProduct?.count % c?.pcs == 0
                                ) {
                                  return {
                                    ...dsc,
                                    productCount: findProduct?.count,
                                  };
                                }
                                return dsc;
                              });
                          }
                          updatedDiscounts = updatedDiscounts.map((ds) => {
                            if (ds.promotion_id == d.promotion_id) {
                              return {
                                ...ds,
                                active: true,
                              };
                            }
                            return ds;
                          });
                        }
                        if (+d.auto_apply == 1) {
                          console.log(d, "category discount - autop apply");
                          const findDiscount = updatedDiscountProducts?.find(
                            (dsc) =>
                              dsc?.discount?.promotion_id == d.promotion_id &&
                              dsc?.product_id == findProduct?.product_id
                          );
                          console.log({ updatedDiscountProducts });

                          if (!findDiscount) {
                            updatedDiscountProducts.push({
                              ...findProduct,
                              count: findProduct?.count,
                              countDisc: +c?.pcs,
                              discount: { ...d, active: true },
                            });
                            updatedProducts = updatedProducts.filter((upd) => {
                              if (upd?.product_id == findProduct?.product_id) {
                                return false;
                              }
                              return true;
                            });
                            console.log("findDiscount - false");
                          } else {
                            console.log("findDiscount - true");

                            updatedDiscountProducts =
                              updatedDiscountProducts?.map((dsc) => {
                                if (
                                  dsc?.discount?.promotion_id ==
                                    d?.promotion_id &&
                                  dsc?.product_id == findProduct?.product_id
                                ) {
                                  return {
                                    ...dsc,
                                    count: +dsc?.count + +c?.pcs,
                                    countDisc: +dsc?.countDisc + +c?.pcs,
                                    discount: { ...d, active: true },
                                  };
                                }
                                return dsc;
                              });
                            updatedProducts = updatedProducts.filter((upd) => {
                              if (upd?.product_id == findProduct?.product_id) {
                                return false;
                              }
                              return true;
                            });
                          }

                          updatedDiscounts = updatedDiscounts.map((ds) => {
                            if (ds.promotion_id == d.promotion_id) {
                              return {
                                ...ds,
                                active: true,
                                end: true,
                                prodCount: 1,
                              };
                            }
                            return ds;
                          });
                        }
                      }
                    }
                    break;
                  // case 3: // modifications
                  //   handleModificationCondition(d, c, activeDiscountProducts);
                  //   break;
                  default:
                    console.warn("Unknown condition type:", c.type);
                }
              }
            }
            // if (params?.conditions_rule == "and") {
            //   const conditions = params?.conditions;
            //   let activeConditionProducts = []; // To'g'ri kelgan mahsulotlar uchun bo'sh massiv
            //   let allConditionsMet = true;

            //   for (let i = 0; i < conditions.length; i++) {
            //     const condition = conditions[i];
            //     let conditionMet = false;

            //     switch (condition.type) {
            //       case 1: // category
            //         const filterConditionCategory = activeDiscProducts?.filter(
            //           (pr) => pr?.menu_category_id == condition?.id
            //         );
            //         if (filterConditionCategory?.length > 0) {
            //           conditionMet = true;
            //           // Mos kelgan mahsulotlarni qo'shish
            //           activeConditionProducts = [
            //             ...activeConditionProducts,
            //             ...filterConditionCategory,
            //           ];
            //         }
            //         break;

            //       case 2: // product
            //         const filterConditionProducts = activeDiscProducts?.filter(
            //           (pr) => pr?.product_id == condition?.id
            //         );
            //         if (filterConditionProducts?.length > 0) {
            //           conditionMet = true;
            //           // Mos kelgan mahsulotlarni qo'shish
            //           activeConditionProducts = [
            //             ...activeConditionProducts,
            //             ...filterConditionProducts,
            //           ];
            //         }
            //         break;

            //       case 3: // modifications
            //         const filterConditionModif = activeDiscProducts.filter(
            //           (product) =>
            //             product.modifications.some(
            //               (mod) =>
            //                 product.product_id === condition.product_id &&
            //                 mod.id === condition.id
            //             )
            //         );
            //         if (filterConditionModif?.length > 0) {
            //           conditionMet = true;
            //           // Mos kelgan mahsulotlarni qo'shish
            //           activeConditionProducts = [
            //             ...activeConditionProducts,
            //             ...filterConditionModif,
            //           ];
            //         }
            //         break;

            //       default:
            //         console.warn("Unknown condition type:", condition.type);
            //     }

            //     if (!conditionMet) {
            //       allConditionsMet = false;
            //       break;
            //     }
            //   }

            //   if (allConditionsMet) {
            //     console.log("All conditions met. Discount is active.");
            //     if (d?.auto_apply == 1) {
            //       // Auto apply logic
            //       activeConditionProducts.forEach((pf) =>
            //         setDiscountsProduct(pf, { ...d, active: true })
            //       );
            //     } else {
            //       // Manual apply logic
            //       activeConditionProducts.forEach((pf) =>
            //         setDiscountsProduct(pf, { ...d, active: false })
            //       );
            //     }
            //     setActiveDiscount(d.promotion_id, true);
            //   } else {
            //     console.log("Conditions not met. Discount is inactive.");
            //     setActiveDiscount(d.promotion_id, false);
            //   }
            //   console.log(
            //     "Active Modification Products:",
            //     activeConditionProducts
            //   );
            // }
            // const findDiscInProd = updatedProducts.filter((prod) =>
            //   prod?.discounts?.find((ds) => ds.promotion_id == ds.promotion_id)
            // );

            // console.log(findDiscInProd, "findDiscInProd");
            // if (findDiscInProd.length == 0) {
            //   updatedDiscounts = updatedDiscounts.map((dss) => {
            //     if (dss?.promotion_id == d?.promotion_id) {
            //       return {
            //         ...dss,
            //         active: false,
            //         end: false,
            //       };
            //     } else return dss;
            //   });
            // }
            localStorage.setItem(
              "discountProducts",
              JSON.stringify(updatedDiscountProducts)
            );
          }

          localStorage.setItem("products", JSON.stringify(updatedProducts));
          localStorage.setItem("discounts", JSON.stringify(updatedDiscounts));
          return { products: updatedProducts, discountProducts: updatedDiscountProducts, discounts: updatedDiscounts };
        }

        localStorage.setItem("products", JSON.stringify(updatedProducts));
        return { products: updatedProducts };
      }

      if (product_id && modif_id) {
        const updatedProducts = state.products.map((product) => {
          if (product?.product_id === product_id) {
            const updatedModifications = product.modifications
              .map((mod) =>
                mod?.modificator_id === modif_id && mod.count > 0
                  ? { ...mod, count: mod.count - 1 }
                  : mod
              )
              .filter((mod) => mod.count > 0);

            if (product.count > 0 || updatedModifications.length > 0) {
              return { ...product, modifications: updatedModifications };
            }
            return null;
          }
          return product;
        });

        let finalProducts = updatedProducts
          .map((product) => {
            if (product?.modifications?.length === 0) {
              return null;
            }
            return product;
          })
          .filter((p) => p !== null);

        localStorage.setItem("products", JSON.stringify(finalProducts));
        return { products: finalProducts };
      }
    }),
  resetProduct: () => set(() => ({ products: [] })),
  incrementDiscount: (discount) =>
    set((state) => {
      let updatedProducts = [...state?.products];
      let updatedDiscounts = [...state?.discounts];
      let filterProductDiscount = [...state.discountProducts];
      console.log("DEBUG incrementDiscount START:", {
        promotion_id: discount?.promotion_id,
        productsCount: updatedProducts.length,
        products: updatedProducts.map(p => ({ id: p.product_id, count: p.count })),
        discountProductsCount: filterProductDiscount.length,
        discountProducts: filterProductDiscount.map(p => ({ id: p.product_id, promo: p.discount?.promotion_id, active: p.discount?.active, isBonus: p.isBonusProduct })),
      });
      let firstActiveApplied = false;
      filterProductDiscount.sort((a, b) => {
        if (a.indexDisc == null && b.indexDisc == null) return 0; // Ikkalasi ham yo'q bo'lsa, tartibni o'zgartirmaslik
        if (a.indexDisc == null) return 1; // `a.indexDisc` yo'q bo'lsa, `a` oxiriga o'tadi
        if (b.indexDisc == null) return -1; // `b.indexDisc` yo'q bo'lsa, `b` oxiriga o'tadi
        return a.indexDisc - b.indexDisc; // O'sish tartibida saralash
      });

      filterProductDiscount = filterProductDiscount?.map((fDisc, idx) => {
        const findProd = updatedProducts?.find(
          (prd) => prd?.product_id == fDisc?.product_id
        );

        // Bonus product (result_type=1) - faqat active qilish
        if (
          fDisc?.discount?.promotion_id == discount?.promotion_id &&
          fDisc?.isBonusProduct &&
          !fDisc?.discount?.active
        ) {
          updatedDiscounts = updatedDiscounts.map((upd) => {
            if (upd?.promotion_id == discount?.promotion_id) {
              return { ...upd, active: true, end: true, prodCount: 1 };
            } else return upd;
          });
          return {
            ...fDisc,
            discount: { ...fDisc?.discount, active: true },
          };
        }

        if (
          fDisc?.discount?.promotion_id == discount?.promotion_id &&
          findProd
        ) {
          const storedDiscount = fDisc?.discount;
          // Kamida (faqat birinchi mahsulotni active qilish)
          if (
            discount?.params?.conditions_exactly == 0 &&
            !firstActiveApplied &&
            !storedDiscount?.active
          ) {
            firstActiveApplied = true; // Birinchi mahsulotni active qilishni belgilaymiz
            updatedDiscounts = updatedDiscounts.map((upd) => {
              if (upd?.promotion_id == discount?.promotion_id) {
                return { ...upd, active: true, end: true, prodCount: 1 };
              } else return upd;
            });
            updatedProducts = updatedProducts?.filter((prd) => {
              if (prd?.product_id == fDisc?.product_id) {
                return false;
              } else return true;
            });
            return {
              ...fDisc,
              discount: { ...fDisc?.discount, active: true },
            };
          } else if (
            discount?.params?.accumulation_type == 1 &&
            !storedDiscount?.active &&
            !firstActiveApplied
          ) {
            //bitta checkda faqat bitta aksiya
            if (discount?.params?.conditions_exactly == 1) {
              firstActiveApplied = true;
              updatedDiscounts = updatedDiscounts.map((upd) => {
                if (+upd?.promotion_id == +discount?.promotion_id) {
                  return { ...upd, active: true, end: true, prodCount: 1 };
                } else return upd;
              });
              updatedProducts = updatedProducts
                ?.map((prd) => {
                  if (prd?.product_id == fDisc?.product_id) {
                    return { ...prd, count: prd?.count - fDisc?.countDisc };
                  } else return prd;
                })
                .filter((prd) => prd.count > 0);
              return {
                ...fDisc,
                discount: { ...fDisc?.discount, active: true },
              };
            }
          } else if (
            discount?.params?.accumulation_type == 2 &&
            discount?.params?.conditions_exactly == 1 &&
            fDisc?.productCount >= fDisc?.countDisc
          ) {
            //bitta checkda bir nechta aksiya bo'lishi
            //aniq

            updatedDiscounts = updatedDiscounts.map((upd) => {
              if (upd?.promotion_id === discount?.promotion_id) {
                return { ...upd, prodCount: upd?.prodCount + 1 };
              } else return upd;
            });

            updatedProducts = updatedProducts
              ?.map((prd) => {
                if (
                  prd?.product_id == fDisc?.product_id &&
                  prd?.count >= fDisc?.countDisc
                ) {
                  return { ...prd, count: prd?.count - fDisc?.countDisc };
                } else return prd;
              })
              .filter((prd) => prd.count > 0);

            return {
              ...fDisc,
              discount: {
                ...fDisc?.discount,
                active: true,
              },
              count: fDisc?.count + fDisc?.countDisc,
              productCount: fDisc?.productCount - fDisc?.countDisc,
            };
          } else {
            return fDisc;
          }
        } else {
          return fDisc;
        }
        firstActiveApplied = true;
      });
      localStorage.setItem("products", JSON.stringify(updatedProducts));
      localStorage.setItem(
        "discountProducts",
        JSON.stringify(filterProductDiscount)
      );
      console.log("DEBUG incrementDiscount END:", {
        productsCount: updatedProducts.length,
        products: updatedProducts.map(p => ({ id: p.product_id, count: p.count })),
        activeDiscountProducts: filterProductDiscount.filter(p => p.discount?.active).map(p => ({ id: p.product_id, promo: p.discount?.promotion_id })),
      });
      return {
        discountProducts: filterProductDiscount,
        products: updatedProducts,
      };
    }),
  decrementDiscount: (discount) =>
    set((state) => {
      let filterProductDiscount = [...state?.discountProducts];
      let updatedProducts = [...state.products];

      filterProductDiscount = filterProductDiscount?.map((fDisc) => {
        if (
          fDisc?.discount?.promotion_id == discount?.promotion_id &&
          fDisc?.discount?.active
        ) {
          // Bonus product - faqat deaktivatsiya qilish, productlarga qaytarmaslik
          if (fDisc?.isBonusProduct) {
            return {
              ...fDisc,
              discount: { ...fDisc.discount, active: false },
            };
          }

          const discountProduct = updatedProducts?.find(
            (prod) => prod?.product_id === fDisc.product_id
          );

          if (discountProduct) {
            // If the product exists, update its count
            updatedProducts = updatedProducts?.map((prd) => {
              if (prd?.product_id == discountProduct?.product_id) {
                return {
                  ...prd,
                  count: (prd?.count || 0) + (fDisc?.count || 0),
                };
              }
              return prd;
            });
          } else {
            const { discounts, end, countDisc, productCount, ...newProduct } =
              fDisc;

            updatedProducts.push({
              ...newProduct,
              count: fDisc?.count || 0,
            });
          }
          if (
            discount?.params?.accumulation_type == 2 &&
            discount?.params?.conditions_exactly == 1
          ) {
            return {
              ...fDisc,
              productCount: fDisc?.count || 0,
              count: 0,
              discount: { ...fDisc.discount, active: false },
            };
          } else {
            return {
              ...fDisc,
              productCount: fDisc?.count || 0,
              discount: { ...fDisc.discount, active: false },
            };
          }
        } else {
          return fDisc;
        }
      });
      localStorage.setItem("products", JSON.stringify(updatedProducts));
      localStorage.setItem(
        "discountProducts",
        JSON.stringify(filterProductDiscount)
      );
      return {
        discountProducts: filterProductDiscount,
        products: updatedProducts,
      };
    }),
  removeDiscount: () =>
    set(() => {
      return { discountProducts: [] };
    }),
}));

export default useProductStore;
