"use client";

import React, { useEffect, useState } from "react";
import Container from "@/components/shared/container";
import DeliveryCardOrder from "@/components/pages/delivery/cardOrder";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import LoaderDelivery from "@/components/pages/delivery/loaderDelivery";
import Cookies from "js-cookie";
import { showNewOrderToast } from "@/lib/functions";
import Link from "next/link";
import useAudio from "@/hooks/use-audio";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Loader from "@/components/shared/loader";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io();
export default function DeliveryRoot() {
  const auth = Cookies.get("auth");
  const { playSound } = useAudio();
  const [orderData, setOrderData] = useState([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const authorization = auth ? JSON.parse(auth) : null;
  const user_id = authorization?.user_id;

  const filterOrder = useQuery(api.order.getByDeliverId, {
    deliver_id: user_id ? user_id : null,
  });

  const waitingOrder = useQuery(api.order.getByDeliverId, {
    deliver_id: user_id ? user_id : null,
    status: "waiting",
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      orderData.map(async (order) => {
        if (order.status == "in-deliver") {
          const {
            _id,
            spot_id,
            deliver_id,
            transaction_id,
            chat_id,
            spot_tablet_id,
          } = order;
          const res = await axios.patch("/api/order", {
            _id,
            status: "finished",
          });
          const in_order = axios.patch("/api/transaction", {
            spot_id,
            transaction_id,
            courier_id: deliver_id,
            processing_status: 50,
            spot_tablet_id,
          });
          if (res && in_order) {
            setOpen(false);
            socket.emit("order-finished", {
              spot_id,
              deliver_id,
              transaction_id,
              status: "finished",
            });
            socket.emit("order-status", {
              chat_id,
              order_status: "finished",
            });
          }
        }
      });
      toastSunner.success("Заказ выполнен успешно!");
    } catch (error) {
      console.log(error);
      toastSunner.error("Что-то пошло не так, попробуйте еще раз!!!");
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  useEffect(() => {
    if (filterOrder?.length > 0) {
      setOrderData(filterOrder.filter((order) => order?.status != "finished"));
    } else {
      setOrderData([]);
    }
  }, [filterOrder]);

  useEffect(() => {
    if (waitingOrder?.length > 0) {
      playSound("notification.mp3");
      waitingOrder.forEach((order) => {
        return showNewOrderToast(order, authorization);
      });
    }
  }, [waitingOrder]);

  return (
    <Container className="bg-background flex flex-col max-w-[500px] mx-auto w-11/12 justify-center items-center mt-[88px] mb-40">
      <section className="flex flex-col w-full gap-4 mt-4">
        {orderData.length > 0 ? (
          <div className="flex flex-col space-y-3">
            {orderData.filter((order) => order.status == "in-deliver").length >
              0 && (
              <AlertDialog
                open={open}
                onOpenChange={setOpen}
                className="z-[9999] max-w-11/12 mx-auto"
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className=" bg-primary hover:bg-primary hover:opacity-[0.9] transition-all ease-linear border-border border-[1px]"
                  >
                    <span className="textNormal2 text-white">
                      Завершить все заказы
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="z-[1000] rounded-md w-11/12 mx-auto">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Вы действительно хотите завершить все заказы?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Все имеющиеся у вас заказы будут завершены, если вы
                      нажмете кнопку «Продолжить».
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setOpen(false)}>
                      Отмена
                    </AlertDialogCancel>

                    <Button
                      disabled={isLoading}
                      className="hover:bg-primary"
                      onClick={handleSubmit}
                    >
                      {isLoading ? (
                        <div className="flex justify-between items-center gap-2">
                          <Loader />
                          <span className="">Загрузка...</span>
                        </div>
                      ) : (
                        "Продолжить"
                      )}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {orderData.map((item, idx) => (
              <Link href={`/delivery/${item?._id}`} key={item.id || idx}>
                <DeliveryCardOrder data={item} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col gap-3 justify-center items-center">
            <LoaderDelivery />
            <h1 className="textNormal2 font-bold text-thin">
              Заказ недоступен
            </h1>
          </div>
        )}
      </section>
    </Container>
  );
}
