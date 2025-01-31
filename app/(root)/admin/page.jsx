import OrderStatistic from "@/components/pages/admin/orderStatistic";
import { ChartComponent } from "@/components/shared/chartComponent";
import Container from "@/components/shared/container";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

import React from "react";
import { format } from "date-fns"; // Make sure to import `format` from `date-fns`

export default async function Order() {
  const orderData = await fetchQuery(api.order.get);
  
  const transformedChartData = orderData?.reduce((acc, order) => {
    const date = format(new Date(order._creationTime), "yyyy-MM-dd");

    // Initialize the date entry if it doesn't exist
    if (!acc[date]) {
      acc[date] = { date, count: 0 };
    }
    acc[date].count += 1;
    return acc;
  }, {});

  const chartData = transformedChartData
    ? Object.values(transformedChartData)
    : [];
  

  return (
    <Container className="flex flex-col gap-4 mt-32 mb-4">
      <OrderStatistic />
      <ChartComponent data={chartData} />
    </Container>
  );
}
