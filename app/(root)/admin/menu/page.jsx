import FetchDataComponent from "@/components/pages/admin/fetchDataComponent";
import ProductItem from "@/components/pages/admin/productitem";
import Container from "@/components/shared/container";
import SearchComponent from "@/components/shared/searchComponent";
import { ApiService } from "@/lib/api.services";
import { ordersData } from "@/lib/iterationDetails";
import axios from "axios";
import React from "react";

export default async function Menu() {
  const { response } = await ApiService.getData(`menu.getCategories`);
  const { response: products } = await ApiService.getData(`menu.getProducts`);
  return (
    <Container
      className={"mt-32 flex flex-col gap-4 justify-start items-start mb-4"}
    >
      <section className="flex justify-between items-center gap-3 w-full">
        <h1 className="font-bold textNormal4">Категории</h1>
        <SearchComponent />
      </section>
      <FetchDataComponent response={response} type="category" />
    </Container>
  );
}
