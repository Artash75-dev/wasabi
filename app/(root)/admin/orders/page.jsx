import OrderStatistic from "@/components/pages/admin/orderStatistic";
import OrderTable from "@/components/pages/admin/orderTable";
import Container from "@/components/shared/container";
import { ChevronRight } from "lucide-react";
import React from "react";

export default function Orders() {
  return (
    <Container className={"flex flex-col justify-end items-end gap-4 mt-32 mb-4"}>
      <OrderStatistic />
      <OrderTable />
    </Container>
  );
}

