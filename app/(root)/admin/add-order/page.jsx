import OrderAddInfo from "@/app/(root)/admin/add-order/_components/OrderAddInfo";
import SideBarOrder from "@/app/(root)/admin/add-order/_components/orderSidebar";
import { toAdminProductSummaries } from "@/lib/posterProducts";
import { POSTER_API, POSTER_TOKEN } from "@/lib/utils";
import React from "react";

const fetchData = async (url) => {
  const res = await fetch(`${POSTER_API}/${url}?${POSTER_TOKEN}`, {
    next: { tags: ["products"], revalidate: 3600 }, // 1 soat cache
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return res.json();
};

export default async function AddOrder() {
  const [categoryData, productsData, orderSources] = await Promise.all([
    fetchData(`menu.getCategories`),
    fetchData(`menu.getProducts`),
    fetchData(`settings.getOrderSources`),
  ]);
  const products = toAdminProductSummaries(productsData?.response);

  return (
    <main className="max-w-[1440px] mx-auto mt-20 grid grid-cols-5 gap-3">
      <SideBarOrder
        categoryData={categoryData?.response}
        productsData={products}
        orderSources={orderSources?.response}
      />
      <OrderAddInfo categoryData={categoryData?.response} productsData={products} />
    </main>
  );
}
