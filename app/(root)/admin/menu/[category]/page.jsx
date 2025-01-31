import FetchDataComponent from "@/components/pages/admin/fetchDataComponent";
import ProductItem from "@/components/pages/admin/productitem";
import Container from "@/components/shared/container";
import SearchComponent from "@/components/shared/searchComponent";
import { Button } from "@/components/ui/button";
import { ApiService } from "@/lib/api.services";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

export default async function Categories({ params }) {
  const { category } = params;
  const { response } = await ApiService.getData(
    `menu.getProducts`,
    `&category_id=${category}`
  );

  return (
    <Container
      className={"mt-32 flex flex-col gap-4 justify-start items-start mb-4"}
    >
      <section className="flex justify-between items-center gap-3 w-full">
        <div className="flex justify-start items-center gap-2">
          <Link href="/admin/menu">
            <Button
              href="/admin/menu"
              className="hover:bg-transparent bg-transparent border text-primary textSmall3 font-medium px-2"
            >
              <ChevronLeft />
            </Button>
          </Link>
          <h1 className="font-bold textNormal4">Товары</h1>
        </div>
        <SearchComponent />
      </section>
      <FetchDataComponent response={response} type="product" />
    </Container>
  );
}
