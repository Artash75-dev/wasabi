"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { OctagonX, PackagePlus } from "lucide-react";
import { formatCreationTime, showNewOrderToast } from "@/lib/functions";
import useAudio from "@/hooks/use-audio";

export default function NotificationModal({ authData }) {
  const [isOpen, setIsOpen] = useState(false);
  const { playSound } = useAudio();

  const orderData =
    useQuery(api.order.getByDeliverId, {
      deliver_id: authData?.user_id,
      status: "waiting",
    }) || [];

  useEffect(() => {
    if (orderData.length > 0) {
      playSound("notification.mp3");
    }
  }, [orderData]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          onClick={() => setIsOpen(true)}
          data-count={orderData?.length || 0}
          className={`${
            orderData?.length > 0 && "notf-count"
          } flex p-2 rounded-full transition-all duration-300 ease-linear relative text-white text-2xl`}
        >
          <IoMdNotificationsOutline />
        </button>
      </SheetTrigger>
      <SheetContent
        className="p-0"
        isClose={true}
        onClose={() => setIsOpen(false)}
      >
        <SheetHeader>
          <SheetTitle></SheetTitle>
          <div className="font-bold text-start border-border border-b-2 py-3 px-2 flex flex-col">
            <h1 className="text-thin textNormal1">{authData?.name}</h1>
            <p className="text-thin-secondary textSmall1">{authData?.login}</p>
          </div>
          <div className="px-2 pb-3 flex justify-start items-start gap-3 flex-col h-[calc(100vh-60px)] overflow-y-scroll">
            {orderData?.length > 0 ? (
              <>
                {orderData?.map((order) => (
                  <div
                    onClick={() => showNewOrderToast(order)}
                    key={order._id}
                    className="cursor-pointer flex gap-4 justify-start items-center px-2 py-1 rounded-md border-2 border-border w-full"
                  >
                    <PackagePlus size={32} className="text-primary" />
                    <div className="w-full space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        <h1 className="textSmall3 font-bold text-thin">
                          Заказ №{order?.order_num}
                        </h1>
                        <h1 className="textSmall1 font-bold text-thin">
                          {order?.phone}
                        </h1>
                      </div>
                      <div className="flex w-full justify-between items-center">
                        <div className="textSmall1">
                          <h1>{formatCreationTime(order?._creationTime)}</h1>
                        </div>
                        <p className="textSmall1">Через бота</p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="w-full gap-2 flex justify-start items-center font-bold text-yellow-500 textSmall3">
                <OctagonX />
                <h1 className="font-bold text-yellow-500 textSmall3">
                  Уведомления недоступны!!!
                </h1>
              </div>
            )}
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
