"use client";
import { api } from "@/convex/_generated/api";
import { statusData } from "@/lib/iterationDetails";
import { useQuery } from "convex/react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  filterOrdersByTimeRange,
  formatCreationTime,
  formatNumber,
} from "@/lib/functions";
import { useEvent } from "@/store/event";

const ITEMS_PER_PAGE = 5;

const TableHeader = ({ title, count, color, index, status }) => (
  <th
    className={`gap-2 cursor-pointer min-w-96 px-4 py-2 text-left text-foreground ${
      index !== 5 && "border-r-2"
    }`}
  >
    <Link
      href={{ pathname: "orders/all", query: { status } }}
      className="flex justify-between items-center gap-2"
    >
      <h1 className="flex justify-start items-center gap-2">
        {title}
        <span
          className={`w-8 h-8 flex justify-center items-center rounded-full text-${color}-600 bg-${color}-100 textSmall2`}
        >
          {formatNumber(count)}
        </span>
      </h1>
      <ChevronRight className="text-gray-500" />
    </Link>
  </th>
);

const TableRow = ({ order }) => {
  const {
    transaction_id,
    order_num,
    client_name,
    spot_name,
    deliver_name,
    _creationTime,
    _id,
  } = order;
  return (
    <Link href={`/admin/orders/${_id}`} className="w-96 px-4 py-2 text-left">
      <div className="p-4 rounded-md bg-white space-y-2">
        <article className="flex justify-between items-center gap-2">
          <h1 className="font-bold textNormal2">Заказ № {order_num}</h1>
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
            <span className="col-span-2 text-end">{deliver_name || "--"}</span>
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
    </Link>
  );
};

export default function OrderTable() {
  const ordersData = useQuery(api.order.get) || [];
  const [page, setPage] = useState({});
  const { timeRange, setTimeRange } = useEvent();

  // Filter orderData based on time range
  const filteredOrders = filterOrdersByTimeRange(ordersData, timeRange);
  const orderColors = {
    created: "blue",
    waiting: "orange",
    cooking: "indigo",
    "in-deliver": "sky",
    finished: "green",
    cancelled: "red",
  };

  const handlePageChange = (status, newPage) => {
    const maxPage = Math.ceil(
      filteredOrders?.filter((order) => order.status === status).length /
        ITEMS_PER_PAGE
    );
    if (newPage > 0 && newPage <= maxPage) {
      setPage((prevPage) => ({
        ...prevPage,
        [status]: newPage,
      }));
    }
  };

  return (
    <main className="relative w-full h-full max-w-full overflow-scroll simple-scrollbar mt-10 pb-4">
      <table>
        <thead>
          <tr>
            {statusData.map((item, idx) => (
              <TableHeader
                index={idx}
                key={item.status}
                title={item.title}
                count={
                  filteredOrders?.filter(
                    (order) => order.status === item.status
                  ).length
                }
                color={orderColors[item.status] || "gray"}
                status={item.status}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {statusData.map((item, idx) => {
              const ordersForStatus = filteredOrders
                ?.slice()
                ?.reverse()
                ?.filter((order) => order.status === item.status);
              const currentPage = page[item.status] || 1;
              const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
              const paginatedOrders = ordersForStatus.slice(
                startIdx,
                startIdx + ITEMS_PER_PAGE
              );

              return (
                <td
                  key={idx}
                  className={`px-2 align-top ${idx !== 5 && "border-r-2"}`}
                >
                  <div className="space-y-4 w-full">
                    <div className="">
                      {paginatedOrders?.map((order, idx) => (
                        <TableRow key={idx} order={order} />
                      ))}
                    </div>
                    {/* Pagination placed here at the bottom */}
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            className={`${
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }`}
                            onClick={() =>
                              handlePageChange(item.status, currentPage - 1)
                            }
                            disabled={currentPage === 1}
                          />
                        </PaginationItem>
                        {Array.from(
                          {
                            length: Math.ceil(
                              ordersForStatus.length / ITEMS_PER_PAGE
                            ),
                          },
                          (_, pageNum) => pageNum + 1
                        ).map((pageNum) => {
                          const isCurrentPage = currentPage === pageNum;
                          const totalPages = Math.ceil(
                            ordersForStatus.length / ITEMS_PER_PAGE
                          );

                          const shouldShowPage =
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            Math.abs(currentPage - pageNum) <= 1;

                          const shouldShowEllipsisBefore =
                            pageNum === currentPage - 2 && currentPage > 3;
                          const shouldShowEllipsisAfter =
                            pageNum === currentPage + 2 &&
                            currentPage < totalPages - 2;

                          return (
                            <React.Fragment key={pageNum}>
                              {shouldShowPage ? (
                                <PaginationItem>
                                  <PaginationLink
                                    className="h-6 w-6 cursor-pointer"
                                    isActive={isCurrentPage}
                                    onClick={() =>
                                      handlePageChange(item.status, pageNum)
                                    }
                                  >
                                    {pageNum}
                                  </PaginationLink>
                                </PaginationItem>
                              ) : (
                                <>
                                  {shouldShowEllipsisBefore && (
                                    <span className="px-2">...</span>
                                  )}
                                  {shouldShowEllipsisAfter && (
                                    <span className="px-2">...</span>
                                  )}
                                </>
                              )}
                            </React.Fragment>
                          );
                        })}
                        <PaginationItem>
                          <PaginationNext
                            className={`pointer-events-none ${
                              startIdx + ITEMS_PER_PAGE >=
                              ordersForStatus.length
                                ? "opacity-50"
                                : ""
                            }`}
                            onClick={() =>
                              handlePageChange(item.status, currentPage + 1)
                            }
                            disabled={
                              startIdx + ITEMS_PER_PAGE >=
                              ordersForStatus.length
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </main>
  );
}
