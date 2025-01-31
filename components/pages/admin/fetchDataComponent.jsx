"use client";

import React from "react";
import ProductItem from "./productitem";
import { useEvent } from "@/store/event";

export default function FetchDataComponent({ response, type }) {
  const { searchValue } = useEvent();

  // Ensure searchValue is a string before calling .toLowerCase()
  const normalizedSearchValue = searchValue
    ? String(searchValue).toLowerCase()
    : "";

  const filterData = response?.filter((item) => {
    if (type === "product") {
      return item.product_name.toLowerCase().includes(normalizedSearchValue);
    } else if (type === "category") {
      return item.category_name.toLowerCase().includes(normalizedSearchValue);
    } else {
      return true;
    }
  });

  return (
    <section className="w-full grid grid-cols-4 2xl:grid-cols-5 gap-4">
      {filterData.length > 0 ? (
        <>
          {filterData?.map((item, idx) => {
            let name = "",
              href = "";
            if (type === "product") {
              name = item.product_name.split("$")[0];
              href = `/admin/menu/${item.menu_category_id}/${item.product_id}`;
            }
            if (type === "category") {
              name = item.category_name.split("$")[0];
              href = `/admin/menu/${item.category_id}`;
            }
            return (
              <ProductItem
                key={idx}
                href={href}
                id={item.id}
                title={name}
                description={"Классические суши от WASSABI"}
                image={item.category_photo}
              />
            );
          })}
        </>
      ) : (
        <div className="w-full font-medium textNormal2">Ничего не найдено</div>
      )}
    </section>
  );
}
