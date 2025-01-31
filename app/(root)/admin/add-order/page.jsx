import OrderAddInfo from "@/app/(root)/admin/add-order/_components/OrderAddInfo";
import SideBarOrder from "@/app/(root)/admin/add-order/_components/orderSidebar";
import { ApiService } from "@/lib/api.services";
import React from "react";

export default async function AddOrder() {
  const { response: categoryData } =
    await ApiService.getData(`menu.getCategories`);
  const { response: productsData } =
    await ApiService.getData(`menu.getProducts`);

  const { response: orderSources } = await ApiService.getData(
    `settings.getOrderSources`
  );

  return (
    <main className={"max-w-[1440px] mx-auto mt-20 grid grid-cols-5 gap-3"}>
      <SideBarOrder
        categoryData={categoryData}
        productsData={productsData}
        orderSources={orderSources}
      />
      <OrderAddInfo categoryData={categoryData} productsData={productsData} />
    </main>
  );
}
