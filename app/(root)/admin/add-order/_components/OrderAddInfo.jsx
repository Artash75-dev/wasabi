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
  const { setProducts } = useProductStore();
  const { orderData } = orderCreateInfo();
  const [data, setData] = useState(null);
  const [filterSearchData, setFilterSearchData] = useState(null);
  const { searchValue, searchFocus } = useEvent();
  const searchParams = useSearchParams();
  const topCategory = searchParams.get("topCategory");
  const category = searchParams.get("category");
  const client = searchParams.get("client");
  const newClient = searchParams.get("newClient");

  const noDisccountCategories = categoryData?.filter(
    (c) => +c?.nodiscount == 1
  );
  const noDiscountProducts = productsData?.filter((p) => +p?.nodiscount == 1);

  const handleGoBack = () => {
    router.back();
  };

  const handleAddProduct = (product, modif_product) => {
    setProducts(
      product,
      modif_product,
      noDiscountProducts,
      noDisccountCategories
    );
  };

  useEffect(() => {
    if (!client && !topCategory && !newClient) {
      router.push("/admin/add-order?topCategory=true");
      return; // Router ishlagandan so'ng boshqa kod bajarilmaydi
    }

    // Mahsulotlarni kategoriya bo‘yicha filtr qilish
    const filterProducts = productsData?.filter((c) => {
      return +c.menu_category_id === +category; // Kategoriya mosligini tekshiradi
    });

    setData(filterProducts);

    // Mahsulotlarni qidiruv so‘ziga ko‘ra filtr qilish
    if (typeof searchValue === "string" && searchValue.trim() !== "") {
      const filteredData = productsData
        ?.filter((product) =>
          product?.product_name
            ?.toLowerCase()
            .includes(searchValue.toLowerCase())
        )
        .sort((a, b) =>
          a.product_name.localeCompare(b.product_name, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );

      setFilterSearchData(filteredData);
    } else {
      setFilterSearchData([]); // Agar qidiruv qiymati bo'lmasa
    }
  }, [
    client,
    topCategory,
    newClient,
    category,
    router,
    productsData,
    searchValue,
  ]);

  return (
    <aside className="col-span-3 p-4">
      <section className="w-full space-y-2">
        {client || newClient ? (
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
