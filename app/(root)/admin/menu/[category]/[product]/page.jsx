import ProductDetail from "@/components/pages/admin/productDetail";
import Container from "@/components/shared/container";
import { ApiService } from "@/lib/api.services";
import React from "react";

export default async function Product({ params }) {
  const { product } = params;
  const { response } = await ApiService.getData(
    `menu.getProduct`,
    `&product_id=${product}`
  );
  return (
    <Container
      className={"mt-32 flex flex-col gap-4 justify-start items-start mb-4"}
    >
      <ProductDetail product={response} />
    </Container>
  );
}
