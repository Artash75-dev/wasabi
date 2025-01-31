"use client";

import SearchComponent from "@/components/shared/searchComponent";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import ProductItem from "../../../../../components/pages/admin/productitem";
import {
  Carousel,
  CarouselContent,
  CarouselCounter,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useProductStore, { orderCreateInfo, useEvent } from "@/store/event";
import ClientInfo from "./clientInfo";

export default function OrderAddInfo({ categoryData, productsData }) {
  const router = useRouter();
  const {
    products,
    discounts,
    discountProducts,
    setProducts,
    setDiscountsProduct,
    removeDiscount,
    setActiveDiscount,
  } = useProductStore();
  const { orderData } = orderCreateInfo();
  const [data, setData] = useState(null);
  const [filterSearchData, setFilterSearchData] = useState(null);
  const { searchValue, searchFocus } = useEvent();
  const searchParams = useSearchParams();
  const topCategory = searchParams.get("topCategory");
  const category = searchParams.get("category");
  const client = searchParams.get("client");
  const noDisccountCategories = categoryData?.filter(
    (c) => +c?.nodiscount == 1
  );
  const noDiscountProducts = productsData?.filter((p) => +p?.nodiscount == 1);

  const handleGoBack = () => {
    router.back();
  };

  const handleAddProduct = (product, modif_product) => {
    setProducts(product, modif_product);
  };

  // Helper functions for each condition type
  const handleCategoryCondition = (d, condition, products) => {
    let findCategory = products.filter(
      (p) => p?.menu_category_id == condition?.id
    );

    let totalItemCount = findCategory.reduce((count, f) => {
      if (f?.modifications?.length > 0) {
        return (
          count +
          f.modifications.reduce((mCount, m) => mCount + (m?.count || 0), 0)
        );
      } else {
        return count + (f.count || 0);
      }
    }, 0);

    if (+d?.params?.accumulation_type == 1 && findCategory?.length > 0) {
      if (
        (+d.params.conditions_exactly == 0 &&
          +condition.pcs <= totalItemCount) ||
        (+d.params.conditions_exactly == 1 && +condition.pcs == totalItemCount)
      ) {
        if (+d.auto_apply == 0) {
          findCategory = findCategory?.map((pf) => {
            return { ...pf, active: false };
          });
          console.log(d, "category discount");
        } else if (+d.auto_apply == 1) {
          findCategory = findCategory?.map((pf) => {
            return { ...pf, active: true };
          });
          console.log(d, "category discount -  auto apply");
        }
        console.log(findCategory);

        setActiveDiscount(d.promotion_id, true, findCategory);
      } else {
        removeDiscount(d, findCategory);
      }
    }

    if (+d?.params?.accumulation_type == 2 && findCategory?.length > 0) {
      setActiveDiscount(d.promotion_id, true);
      if (
        (+d.params.conditions_exactly == 0 &&
          +condition.pcs <= totalItemCount) ||
        (+d.params.conditions_exactly == 1 && +condition.pcs == totalItemCount)
      ) {
        if (+d.auto_apply == 0) {
          findCategory = findCategory?.map((pf) => {
            return { ...pf, active: false };
          });
          // console.log(d, "category discount");
        } else if (+d.auto_apply == 1) {
          findCategory = findCategory?.map((pf) => {
            return { ...pf, active: true };
          });
          // console.log(d, "category discount -  auto apply");
        }

        setActiveDiscount(d.promotion_id, true, findCategory);
      }
    }

    // if (
    //   (+d.params.conditions_exactly == 0 && +condition.pcs <= totalItemCount) ||
    //   (+d.params.conditions_exactly == 1 && +condition.pcs == totalItemCount)
    // ) {
    //   return findCategory;
    // if (+d.auto_apply == 0) {
    //   findCategory.forEach((pf) =>
    //     setDiscountsProduct(pf, { ...d, active: false })
    //   );
    //   console.log(d, "category discount");
    // } else if (+d.auto_apply == 1) {
    //   findCategory.forEach((pf) =>
    //     setDiscountsProduct(pf, { ...d, active: true })
    //   );
    //   console.log(d, "category discount -  autop apply");
    // }
    // setActiveDiscount(d.promotion_id, true);
    // }
    // else {
    // removeDiscount(d);

    // }
  };

  const handleProductCondition = (d, condition, products) => {
    const findProduct = products.find((p) => +p.product_id === +condition.id);
    if (
      findProduct &&
      ((+d.params.conditions_exactly === 0 &&
        +condition.pcs <= findProduct.count) ||
        (+d.params.conditions_exactly === 1 &&
          +condition.pcs === +findProduct.count))
    ) {
      return findProduct;
      // if (+d.auto_apply == 0) {
      //   setDiscountsProduct(findProduct, { ...d, active: false });
      //   console.log(d, "product discount");
      // } else if (+d.auto_apply == 1) {
      //   setDiscountsProduct(findProduct, { ...d, active: true });
      //   console.log(d, "product discount - auto_apply");
      // }
      // setActiveDiscount(d.promotion_id, true);
      // } else {
      //   removeDiscount(d);
      // }
    }
  };

  const handleModificationCondition = (d, condition, products) => {
    const findProduct = products.find(
      (p) => +p.product_id === +condition?.product_id
    );
    const findModificatorProduct = findProduct?.modifications?.find(
      (m) => +m.modificator_id === +condition?.id
    );

    if (
      findModificatorProduct &&
      ((+d.params.conditions_exactly === 0 &&
        +condition?.pcs <= findModificatorProduct.count) ||
        (+d.params.conditions_exactly === 1 &&
          +condition?.pcs === findModificatorProduct.count))
    ) {
      return findModificatorProduct;
      // setDiscountsProduct(findProduct, d);
      // setActiveDiscount(d.promotion_id, true);
      // } else {
      // removeDiscount(d);
    }
  };

  useEffect(() => {
    const activeDiscProducts = products?.filter((pr) => {
      const filterWithProduct = noDiscountProducts?.filter(
        (nd) => +nd?.product_id == pr?.product_id
      );
      const filterWithCategory = noDisccountCategories?.filter(
        (ndc) => ndc?.category_id == pr?.menu_category_id
      );
      if (filterWithProduct?.length > 0 || filterWithCategory?.length > 0) {
        return false;
      } else {
        return true;
      }
    });

    if (activeDiscProducts?.length > 0) {
      for (let i = 0; i < discounts.length; i++) {
        const d = discounts[i];
        const params = d?.params;

        if (params?.conditions_rule == "or") {
          for (let j = 0; j < params?.conditions.length; j++) {
            const c = params?.conditions[j];
            let activeConditionProducts = [];

            switch (c.type) {
              case 1: // category
                handleCategoryCondition(d, c, activeDiscProducts);
                break;
              case 2: // product
                handleProductCondition(d, c, activeDiscProducts);
                break;
              case 3: // modifications
                handleModificationCondition(d, c, activeDiscProducts);
                break;
              default:
                console.warn("Unknown condition type:", c.type);
            }
          }
        }
        if (params?.conditions_rule == "and") {
          const conditions = params?.conditions;
          let activeConditionProducts = []; // To'g'ri kelgan mahsulotlar uchun bo'sh massiv
          let allConditionsMet = true;

          for (let i = 0; i < conditions.length; i++) {
            const condition = conditions[i];
            let conditionMet = false;

            switch (condition.type) {
              case 1: // category
                const filterConditionCategory = activeDiscProducts?.filter(
                  (pr) => pr?.menu_category_id == condition?.id
                );
                if (filterConditionCategory?.length > 0) {
                  conditionMet = true;
                  // Mos kelgan mahsulotlarni qo'shish
                  activeConditionProducts = [
                    ...activeConditionProducts,
                    ...filterConditionCategory,
                  ];
                }
                break;

              case 2: // product
                const filterConditionProducts = activeDiscProducts?.filter(
                  (pr) => pr?.product_id == condition?.id
                );
                if (filterConditionProducts?.length > 0) {
                  conditionMet = true;
                  // Mos kelgan mahsulotlarni qo'shish
                  activeConditionProducts = [
                    ...activeConditionProducts,
                    ...filterConditionProducts,
                  ];
                }
                break;

              case 3: // modifications
                const filterConditionModif = activeDiscProducts.filter(
                  (product) =>
                    product.modifications.some(
                      (mod) =>
                        product.product_id === condition.product_id &&
                        mod.id === condition.id
                    )
                );
                if (filterConditionModif?.length > 0) {
                  conditionMet = true;
                  // Mos kelgan mahsulotlarni qo'shish
                  activeConditionProducts = [
                    ...activeConditionProducts,
                    ...filterConditionModif,
                  ];
                }
                break;

              default:
                console.warn("Unknown condition type:", condition.type);
            }

            if (!conditionMet) {
              allConditionsMet = false;
              break;
            }
          }

          if (allConditionsMet) {
            if (d?.auto_apply == 1) {
              // Auto apply logic
              activeConditionProducts.forEach((pf) =>
                setDiscountsProduct(pf, { ...d, active: true })
              );
            } else {
              // Manual apply logic
              activeConditionProducts.forEach((pf) =>
                setDiscountsProduct(pf, { ...d, active: false })
              );
            }
            setActiveDiscount(d.promotion_id, true);
          } else {
            setActiveDiscount(d.promotion_id, false);
          }
        }
      }
    }
  }, [products, orderData?.client_id]);

  useEffect(() => {
    if (!client && !topCategory) {
      router.push("/admin/add-order?topCategory=true");
    }
    const filterProducts = productsData?.filter((c) => {
      const matchesCategory = +c.menu_category_id === +category;
      return matchesCategory;
    });

    setData(filterProducts);

    const filteredData = [];
    if (typeof searchValue === "string" && searchValue.trim() !== "") {
      for (let i = 0; i < productsData?.length; i++) {
        const product = productsData[i];
        if (
          product?.product_name
            ?.toLowerCase()
            .includes(searchValue.toLowerCase())
        ) {
          filteredData.push(product);
        }
      }
    }
    if (filteredData?.length > 0) {
      setFilterSearchData(filteredData);
    } else {
      setFilterSearchData([]);
    }
  }, [
    client,
    topCategory,
    category,
    router,
    productsData,
    categoryData,
    searchValue,
  ]);

  return (
    <aside className="col-span-3 p-4">
      <section className="w-full space-y-2">
        {client ? (
          <ClientInfo />
        ) : (
          <>
            <div className="flex justify-between items-center gap-3 w-full">
              <div className="flex justify-start items-center gap-2">
                {!searchFocus && topCategory && category && (
                  <Button
                    onClick={handleGoBack}
                    className="hover:bg-transparent bg-transparent border text-primary textSmall3 font-medium px-2"
                  >
                    <ChevronLeft />
                  </Button>
                )}
                {!searchFocus && (
                  <h1 className="font-bold textNormal4">
                    {topCategory && category ? "Товары" : "Категории"}
                  </h1>
                )}
              </div>
              <SearchComponent animate={true} />
            </div>
            {searchValue || searchFocus ? (
              <div className="p-2 w-full h-[calc(100vh-165px)] overflow-y-scroll">
                {filterSearchData?.length > 0 ? (
                  <>
                    {filterSearchData.map((pr, idx) => {
                      const price = pr?.price["1"] / 100;
                      return (
                        <Button
                          onClick={() => handleAddProduct(pr)}
                          key={idx}
                          variant="ghost"
                          className="w-full active:shadow-lg transition-all ease-linear duration-100 active:opacity-70 flex justify-between items-center gap-2 border-border border-b-2 rounded-none"
                        >
                          <h1>{pr?.product_name}</h1>
                          <p>{price} сум</p>
                        </Button>
                      );
                    })}
                  </>
                ) : (
                  <h1>По запросу ничего не найдено</h1>
                )}
              </div>
            ) : (
              <>
                {/* Categories component */}
                {topCategory && !category && (
                  <section className="space-y-4 w-full">
                    <Carousel>
                      <CarouselContent className="">
                        {categoryData &&
                          Array.from(
                            { length: Math.ceil(categoryData?.length / 9) },
                            (_, i) => (
                              <CarouselItem
                                key={i}
                                className="overflow-hidden h-[calc(100vh-180px)] flex justify-center items-center w-full"
                              >
                                {/* 9 ta mahsulotdan iborat grid (3x3 layout) */}
                                <section className="grid grid-cols-3 grid-rows-3 gap-4 w-full h-full">
                                  {categoryData
                                    ?.slice(i * 9, i * 9 + 9)
                                    ?.map((item, idx) => {
                                      const name =
                                        item.category_name.split("$")[0];
                                      return (
                                        <ProductItem
                                          key={idx}
                                          href={`/admin/add-order?topCategory=true&category=${item.category_id}`}
                                          id={item.id}
                                          title={name}
                                          description="Классические суши от WASSABI"
                                          image={item?.category_photo_origin}
                                          className="w-full h-full flex justify-center items-center"
                                        />
                                      );
                                    })}
                                </section>
                              </CarouselItem>
                            )
                          )}
                      </CarouselContent>
                      <CarouselCounter />
                    </Carousel>
                  </section>
                )}

                {/* Products component */}
                {topCategory && category && (
                  <section className="space-y-4 w-full">
                    <Carousel>
                      <CarouselContent className="">
                        {data &&
                          Array.from(
                            { length: Math.ceil(data.length / 9) },
                            (_, i) => (
                              <CarouselItem
                                key={i}
                                className="overflow-hidden h-[calc(100vh-180px)] flex justify-center items-center w-full"
                              >
                                {/* 9 items grid layout (3x3 layout) */}
                                <section className="grid grid-cols-3 grid-rows-3 gap-4 w-full h-full">
                                  {data
                                    ?.slice(i * 9, i * 9 + 9)
                                    ?.map((item, idx) => {
                                      const name =
                                        item.product_name?.split("$")[0];
                                      return (
                                        <DropdownMenu key={idx}>
                                          <DropdownMenuTrigger asChild>
                                            <button
                                              onClick={() =>
                                                handleAddProduct(item)
                                              }
                                              className={`${item?.modifications?.length > 0 ? "" : "active:shadow-lg active:opacity-90"} relative transition-all ease-linear duration-100`}
                                            >
                                              <ProductItem
                                                href={"none"}
                                                id={item.product_id}
                                                title={name}
                                                image={item?.photo_origin}
                                                description={
                                                  "Классические суши от WASSABI"
                                                }
                                                className="w-full h-full flex justify-center items-center"
                                              />
                                            </button>
                                          </DropdownMenuTrigger>
                                          {item?.modifications?.length > 0 && (
                                            <DropdownMenuContent className="">
                                              {item.modifications.map(
                                                (m, idx) => (
                                                  <DropdownMenuItem
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                      handleAddProduct(m, item)
                                                    }
                                                    key={idx}
                                                  >
                                                    {m.modificator_name}
                                                  </DropdownMenuItem>
                                                )
                                              )}
                                            </DropdownMenuContent>
                                          )}
                                        </DropdownMenu>
                                      );
                                    })}
                                </section>
                              </CarouselItem>
                            )
                          )}
                      </CarouselContent>
                      <CarouselCounter />
                    </Carousel>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </section>
    </aside>
  );
}
