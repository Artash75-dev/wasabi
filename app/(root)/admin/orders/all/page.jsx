"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Container from "@/components/shared/container";
import React, { Suspense } from "react";
import NavOrder from "@/components/pages/admin/orderNav";
import { statusData } from "@/lib/iterationDetails";
import { ChevronRight } from "lucide-react";
import { Button } from "@headlessui/react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { filterOrdersByTimeRange, formatCreationTime } from "@/lib/functions";
import Link from "next/link";
import { useEvent } from "@/store/event";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"; // Ensure this component is available
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export default function AllOrders() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  let ordersData = useQuery(api.order.get) || [];
  const { searchValue } = useEvent();
  const { timeRange, setTimeRange } = useEvent();

  // Filter orderData based on time range
  const filteredOrders = filterOrdersByTimeRange(ordersData, timeRange);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filterOrder = filteredOrders
    ?.slice()
    ?.reverse()
    ?.filter((c) => {
      const matchesStatus = status === "all" || c.status === status;
      const matchesSearchValue =
        !searchValue || // If no searchValue is entered
        c.order_num?.toString().includes(searchValue) ||
        c.transaction_id?.toString().includes(searchValue);
      return matchesStatus && matchesSearchValue;
    });

  const totalPages = Math.ceil(filterOrder.length / itemsPerPage);

  // Slice data for current page
  const currentData = filterOrder.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Suspense>
      <Container className="gap-4 mt-32 mb-4 flex flex-col justify-start items-start">
        <div className="w-full flex justify-between items-center gap-2">
          <h1 className="font-bold textNormal4 w-full text-start">Заказы</h1>
          <div className="flex  items-center bg-white px-2 py-1 rounded-md gap-2">
            <h1>Фильтр:</h1>
            <Select className="" value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="w-[160px] rounded-lg sm:ml-auto"
                aria-label="Select a value"
              >
                <SelectValue placeholder="Last 3 months" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="rounded-lg">
                  Все заказы
                </SelectItem>
                <SelectItem value="90d" className="rounded-lg">
                  Последние 3 месяца
                </SelectItem>
                <SelectItem value="30d" className="rounded-lg">
                  Последние 30 дней
                </SelectItem>
                <SelectItem value="7d" className="rounded-lg">
                  Последние 7 дней
                </SelectItem>
                <SelectItem value="1d" className="rounded-lg">
                  Сегодня
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <NavOrder status={status} />
        <main className="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 w-full gap-3">
          {currentData.length > 0 ? (
            <>
              {currentData.map((item, idx) => (
                <div key={idx}>
                  <OrderItem
                    order={{ ...item, orderNumber: item?.order_num }}
                  />
                </div>
              ))}
            </>
          ) : (
            <h1 className="text-thin textNormal1 font-bold">
              Заказ недоступен
            </h1>
          )}
        </main>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem className="cursor-pointer">
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                />
              </PaginationItem>
              {Array.from({ length: totalPages })
                ?.slice()
                ?.reverse()
                ?.map((_, index) => (
                  <PaginationItem className="cursor-pointer" key={index}>
                    <PaginationLink
                      onClick={() => handlePageChange(index + 1)}
                      className={currentPage === index + 1 ? "active" : ""}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              <PaginationItem className="cursor-pointer">
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </Container>
    </Suspense>
  );
}

const OrderItem = ({ order }) => {
  const {
    orderNumber,
    deliver_name,
    client_name,
    spot_name,
    status,
    transaction_id,
    _creationTime,
    _id,
  } = order;

  const orderColors = {
    created: "text-blue-600 bg-blue-100 hover:bg-blue-200",
    waiting: "text-orange-600 bg-orange-100 hover:bg-orange-200",
    cooking: "text-indigo-600 bg-indigo-100 hover:bg-indigo-200",
    "in-deliver": "text-sky-600 bg-sky-100 hover:bg-sky-200",
    finished: "text-green-600 bg-green-100 hover:bg-green-200",
    cancelled: "text-red-600 bg-red-100 hover:bg-red-200",
  };

  const colorClasses =
    orderColors[status] || "text-gray-600 bg-gray-100 hover:bg-gray-200";
  return (
    <Link href={`/admin/orders/${_id}`}>
      <div className="p-4 rounded-md bg-white space-y-3">
        <div className="space-y-2">
          <article className="flex justify-between items-center gap-2">
            <h1 className="font-bold textNormal2">Заказ № {orderNumber}</h1>
            <ChevronRight className="text-gray-500" />
          </article>
          <ul className="textSmall1 space-y-2">
            <li className="text-thin-secondary grid grid-cols-3">
              <h1 className="col-span-1">Номер чека:</h1>
              <span className="col-span-2 text-end">
                {transaction_id || "--"}
              </span>
            </li>
            <li className="text-thin-secondary grid grid-cols-3">
              <h1 className="col-span-1">Клиент:</h1>
              <span className="col-span-2 text-end">{client_name || "--"}</span>
            </li>
            <li className="text-thin-secondary grid grid-cols-3">
              <h1 className="col-span-1">Доставщик:</h1>
              <span className="col-span-2 text-end">
                {deliver_name || "--"}
              </span>
            </li>
            <li className="text-thin-secondary grid grid-cols-3">
              <h1 className="col-span-1">Филиал:</h1>
              <span className="col-span-2 text-end">{spot_name || "--"}</span>
            </li>
            <li className="text-thin-secondary grid grid-cols-3">
              <h1 className="col-span-1">Время заказа:</h1>
              <span className="col-span-2 text-end">
                {formatCreationTime(_creationTime)}
              </span>
            </li>
          </ul>
        </div>
        <div className="flex justify-end">
          <Button
            className={`px-3 py-1 flex justify-center items-center rounded-full text-[12px] font-bold ${colorClasses}`}
          >
            {statusData.find((item) => item.status === status)?.title}
          </Button>
        </div>
      </div>
    </Link>
  );
};
