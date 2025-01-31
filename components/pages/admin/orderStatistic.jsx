"use client";

import CardStatistic from "@/components/shared/cardStatistic";
import { api } from "@/convex/_generated/api";
import { useEvent } from "@/store/event";
import { useQuery } from "convex/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { filterOrdersByTimeRange } from "@/lib/functions";
import { useEffect, useMemo, useState } from "react";
export default function OrderStatistic() {
  const orderData = useQuery(api.order.get) || [];
  const { timeRange, setTimeRange } = useEvent();

  // Memoize filteredOrders to avoid unnecessary calculations
  const filteredOrders = useMemo(
    () => filterOrdersByTimeRange(orderData, timeRange),
    [orderData, timeRange]
  );
  return (
    <>
      <div className="w-full grid grid-cols-4 gap-3">
        <CardStatistic
          title={"Все заказы"}
          description="Все клиенты на сегодня"
          size={filteredOrders.length}
          className="col-span-2 p-5 shadow-sm"
          status={"all"}
        />
        <CardStatistic
          title={"Ждёт подтверждения"}
          description="Количество ждущих подтверждения"
          size={filteredOrders.filter((or) => or.status === "waiting")?.length}
          className="col-span-2 p-5 shadow-sm"
          status={"waiting"}
        />
        <div className="col-span-4 grid grid-cols-3 gap-3 shadow-sm rounded-md">
          <CardStatistic
            title={"Доставляется"}
            description="Количество заказов которые доставляется клиенту"
            size={
              filteredOrders.filter((or) => or.status === "in-deliver")?.length
            }
            className="col-span-1 p-5 shadow-sm"
            status={"in-deliver"}
          />
          <CardStatistic
            title={"Готовится"}
            description="Количество заказов которые готовится"
            size={
              filteredOrders.filter((or) => or.status === "cooking")?.length
            }
            className="col-span-1 p-5 shadow-sm"
            status={"cooking"}
          />
          <CardStatistic
            title={"Завершено"}
            description="Количество заказов которые доставлены"
            size={
              filteredOrders.filter((or) => or.status === "finished")?.length
            }
            className="col-span-1 p-5 shadow-sm"
            status={"finished"}
          />
        </div>
      </div>
      <div className="flex w-full justify-end items-end">
        <div className="flex justify-end items-center bg-white px-2 py-1 rounded-md gap-2">
          <h1>Фильтр :</h1>
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
    </>
  );
}
