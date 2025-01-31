"use client";

import Container from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { formatCreationTime } from "@/lib/functions";
import axios from "axios";
import { Check, ChevronLeft, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
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
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";
import { deliveryStore } from "@/store/event";
import CountdownTimer from "@/components/pages/delivery/CountdownTimer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast as toastSunner } from "sonner";

const socket = io();

const OrderItem = ({ params }) => {
  const { discounts } = deliveryStore();

  const { id } = params;
  const [order, setOrder] = useState();
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  console.log(order);
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
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
        toastSunner.success("Заказ выполнен успешно!");
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
          transaction_id,
        });
        router.push("/delivery");
      }
    } catch (error) {
      console.log(error);
      toastSunner.error("Что-то пошло не так, попробуйте еще раз!!!");
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  const handleBack = () => {
    router.back();
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/order?id=${id}`);
        setOrder(response?.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container className="h-[calc(100vh-88px)] flex gap-2 max-w-[500px] mx-auto w-11/12 justify-center items-center mt-24 mb-40 ">
        <Loader />
        <h1 className="textNormal1 text-thin font-bold">Загрузка...</h1>
      </Container>
    );
  }

  return (
    <Container className="flex flex-col max-w-2xl mx-auto w-full justify-center items-center pt-20 pb-[150px]">
      <section id="order-item" className="w-full space-y-3 pt-4 px-4 py-2">
        <div
          onClick={handleBack}
          className="cursor-pointer flex justify-start items-center gap-2"
        >
          <div className="cursor-pointer">
            <ChevronLeft size={32} className="text-primary border rounded-md" />
          </div>
          <h1 className="font-bold text-xl text-primary text-start">
            Заказ № {order?.order_num}
          </h1>
        </div>
        <div className="space-y-3">
          <ul id="order-color" className="space-y-3">
            <li className="w-full flex justify-between items-center gap-2 py-2 border-b-[1px] border-input">
              <span className="w-[50%] text-start font-medium text-sm">
                Время создания:
              </span>
              <span className="w-[50%] text-end font-medium text-sm">
                {formatCreationTime(order?._creationTime)}
              </span>
            </li>
            {order?.delivery_time && (
              <li className="w-full flex justify-between items-center gap-2 py-2 border-b-[1px] border-input">
                <span className="w-[50%] text-start font-medium text-sm">
                  Время доставки:
                </span>
                <span className="w-[50%] text-end font-medium text-sm">
                  {formatCreationTime(order?.delivery_time)}
                </span>
              </li>
            )}
            {order?.delivery_time && order?.status == "in-deliver" && (
              <li className="w-full flex justify-between items-center gap-2 py-2 border-b-[1px] border-input">
                <span className="w-[50%] text-start font-medium text-sm">
                  Оставшееся время:
                </span>
                <span className="w-[50%] text-end font-medium text-sm">
                  <CountdownTimer
                    deliveryTime={order?.delivery_time}
                    status={order?.status}
                    order_num={order?.order_num}
                  />
                </span>
              </li>
            )}
            <li className="w-full flex justify-between items-center gap-2 py-2 border-b-[1px] border-input">
              <span className="w-[50%] text-start font-medium text-sm">
                Номер чека:
              </span>
              <span className="w-[50%] text-end font-medium text-sm">
                {order?.transaction_id}
              </span>
            </li>
            <li className="w-full flex justify-between items-center gap-2">
              <span className="w-[50%] text-start font-medium text-sm">
                Клиент:
              </span>
              <span className="w-[50%] text-end font-medium text-sm">
                {order?.phone}
                <br /> {order?.client_name}
              </span>
            </li>
            <li className="w-full flex justify-between items-center gap-2">
              <span className="w-[50%] text-start font-medium text-sm">
                Адрес:
              </span>
              <span className="w-[50%] text-end font-medium text-sm">
                {order?.address}
              </span>
            </li>
          </ul>
          <div className="w-full flex justify-end">
            <Button
              onClick={() => {
                const url = `https://yandex.ru/maps/?ll=${order?.location?.longitude},${order?.location?.latitude}&z=14&pt=${order?.location?.longitude},${order?.location?.latitude},pm2blm~${order?.location?.longitude},${order?.location?.latitude},pm2ntm`;
                window.open(url, "_blank");
              }}
              className="border rounded-xl bg-white shadow-sm text-primary"
            >
              Открыть адрес в навигаторе
            </Button>
          </div>
        </div>
        <h1 id="order-color" className="text-start font-medium text-sm">
          Чек:
        </h1>
        <section className="p-3 rounded-xl shadow-sm bg-white">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-thin px-2 textSmall1 py-1 text-left">
                  Наименование
                </th>
                <th className="text-thin px-2 textSmall1 py-1 text-center">
                  Кол-во
                </th>
                <th className="text-thin px-2 textSmall1 py-1 text-right">
                  Цена
                </th>
                <th className="text-thin px-2 textSmall1 py-1 text-right">
                  Итого
                </th>
              </tr>
            </thead>
            <tbody>
              {order?.products?.map((item, index) => {
                const renderRow = (name, count, price, promotion_id) => {
                  const findProdCount = discounts?.find(
                    (prod) => prod?.promotion_id == promotion_id
                  );

                  let prs;
                  if (findProdCount?.params?.result_type == 2) {
                    prs = Math.max(
                      0,
                      price - findProdCount?.params.discount_value / 100
                    );
                  } else if (findProdCount?.params?.result_type == 3) {
                    prs =
                      (price * (100 - +findProdCount?.params.discount_value)) /
                      100;
                  }

                  return (
                    <tr key={`${index}-${name}`} className="border-b">
                      <td className="textSmall1 text-foreground px-2 py-1 text-left">
                        {name}
                      </td>
                      <td className="textSmall1 text-thin px-2 py-1 text-center">
                        {count}
                      </td>
                      {findProdCount ? (
                        <td className="text-thin px-2 py-1 textSmall2 text-right">
                          <h1 className=""> {prs} </h1>
                          <p className="textSmall1 line-through">{price} </p>
                          сум
                        </td>
                      ) : (
                        <td className="text-thin px-2 py-1 textSmall2 text-right">
                          <h1 className=""> {price} </h1>
                          сум
                        </td>
                      )}
                      <td className="text-thin px-2 py-1 textSmall2 text-right">
                        {findProdCount ? (
                          <h1>{prs * count}</h1>
                        ) : (
                          <h1>{price * count}</h1>
                        )}
                        сум
                      </td>
                    </tr>
                  );
                };

                if (item?.modifications?.length > 0) {
                  return (
                    <React.Fragment key={index}>
                      {item.modifications.map((m, i) =>
                        renderRow(
                          `${item.product_name} ${m.modificator_name}`,
                          m.count,
                          Number(m?.spots[0]?.price) / 100
                        )
                      )}
                    </React.Fragment>
                  );
                } else {
                  return renderRow(
                    item.product_name,
                    item.count,
                    item?.price,
                    item?.promotion_id
                  );
                }
              })}
            </tbody>
          </table>
          <div className="w-full flex justify-between items-center gap-2">
            <h1 className="font-bold text-thin px-2 textSmall1 py-1 text-left">
              Сумма доставки
            </h1>
            <p className="font-bold text-thin px-2 py-1 textSmall2 text-right">
              {order?.delivery_price} сум
            </p>
          </div>
          <Collapsible>
            <CollapsibleTrigger className="w-full flex justify-between items-center gap-2 cursor-pointer">
              <h1 className="font-bold text-thin px-2 textSmall1 py-1 text-left">
                Платежная информация
              </h1>
              <div className="flex textSmall2 justify-end items-center gap-2">
                <PanelLeftOpen className="text-thin" /> payme,click ....
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {order?.discount_price > 0 && (
                <div className="w-full flex justify-between items-center gap-2">
                  <h1 className="font-bold text-thin px-2 textSmall1 py-1 text-left">
                    Сумма скидки
                  </h1>
                  <p className="font-bold text-thin px-2 py-1 textSmall2 text-right">
                    {order?.discount_price} сум
                  </p>
                </div>
              )}
              {order?.pay_cash > 0 && (
                <div className="w-full flex justify-between items-center gap-2">
                  <h1 className="font-bold text-thin px-2 textSmall1 py-1 text-left">
                    Наличными
                  </h1>
                  <p className="font-bold text-thin px-2 py-1 textSmall2 text-right">
                    {order?.pay_cash} сум
                  </p>
                </div>
              )}
              {order?.pay_card > 0 && (
                <div className="w-full flex justify-between items-center gap-2">
                  <h1 className="font-bold text-thin px-2 textSmall1 py-1 text-left">
                    Карта
                  </h1>
                  <p className="font-bold text-thin px-2 py-1 textSmall2 text-right">
                    {order?.pay_card} сум
                  </p>
                </div>
              )}
              {order?.pay_payme > 0 && (
                <div className="w-full flex justify-between items-center gap-2">
                  <h1 className="font-bold text-thin px-2 textSmall1 py-1 text-left">
                    Payme
                  </h1>
                  <p className="font-bold text-thin px-2 py-1 textSmall2 text-right">
                    {order?.pay_payme} сум
                  </p>
                </div>
              )}
              {order?.pay_click > 0 && (
                <div className="w-full flex justify-between items-center gap-2">
                  <h1 className="font-bold text-thin px-2 textSmall1 py-1 text-left">
                    Click
                  </h1>
                  <p className="font-bold text-thin px-2 py-1 textSmall2 text-right">
                    {order?.pay_click} сум
                  </p>
                </div>
              )}
              {order?.pay_bonus > 0 && (
                <div className="w-full flex justify-between items-center gap-2">
                  <h1 className="font-bold text-thin px-2 textSmall1 py-1 text-left">
                    Бонус
                  </h1>
                  <p className="font-bold text-thin px-2 py-1 textSmall2 text-right">
                    {order?.pay_bonus} сум
                  </p>
                </div>
              )}
              {order?.pay_sertificate > 0 && (
                <div className="w-full flex justify-between items-center gap-2">
                  <h1 className="font-bold text-thin px-2 textSmall1 py-1 text-left">
                    Сертификат
                  </h1>
                  <p className="font-bold text-thin px-2 py-1 textSmall2 text-right">
                    {order?.pay_sertificate} сум
                  </p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          <div className="w-full flex justify-between items-center gap-2">
            <h1 className="font-bold text-thin px-2 textSmall1 py-1 text-left">
              Общая сумма
            </h1>
            <p className="font-bold text-thin px-2 py-1 textSmall2 text-right">
              {order?.total} сум
            </p>
          </div>
        </section>
        {order?.status == "finished" ? (
          <div className="w-full flex justify-end">
            <Button className="hover:bg-primary border rounded-xl bg-primary text-white shadow-sm text-primary space-x-2">
              <span className="text-white"> Заказ выполнен успешно</span>
            </Button>
          </div>
        ) : (
          <div className="w-full flex justify-end">
            <Button
              onClick={() => setOpen(true)}
              className="border rounded-xl bg-white shadow-sm text-primary space-x-2"
            >
              <Check /> <span> Подтвердить доставку</span>
            </Button>
          </div>
        )}
      </section>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        className="z-[9999] max-w-11/12 mx-auto"
      >
        <AlertDialogTrigger asChild>
          <Button className="hidden">Trigger</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="z-[1000] rounded-md w-11/12 mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Вы уверены, что хотите выполнить заказ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Если вы действительно хотите выполнить заказ, нажмите кнопку
              «Продолжить».
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
    </Container>
  );
};
export default OrderItem;
