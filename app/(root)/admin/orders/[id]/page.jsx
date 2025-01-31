"use client";

import Container from "@/components/shared/container";
import Loader from "@/components/shared/loader";
import { api } from "@/convex/_generated/api";
import { statusData } from "@/lib/iterationDetails";
import useProductStore from "@/store/event";
import { useQuery } from "convex/react";
import React, { useEffect, useState } from "react";

const OrderDetails = ({ params }) => {
  const { discounts } = useProductStore();
  const { id } = params;
  const orderData = useQuery(api.order.getById, {
    _id: id,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setInterval(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <Container className="flex w-full justify-center items-center h-[calc(100vh-80px)] gap-4 pt-24">
        <Loader /> Загрузка...
      </Container>
    );
  }

  return (
    <Container className="flex flex-col justify-start items-start gap-4 mt-24 mb-4">
      <h1 className="textNormal4 font-bold w-full text-start">
        Заказ №{orderData?.order_num}
      </h1>
      <section className="lg:max-w-[70%] w-full grid grid-cols-2 gap-3">
        <div className="p-4 space-y-2 text-thin rounded-md shadow-custom w-full">
          <h1 className="font-bold textSmall1">Детали </h1>

          <ul className="textSmall1 space-y-3">
            <li className="text-thin-secondary grid grid-cols-3 border-b-[1px] py-1">
              <h1 className="col-span-1 font-bold">Филиал:</h1>
              <span className="col-span-2">{orderData?.spot_name}</span>
            </li>
            <li className="text-thin-secondary grid grid-cols-3 border-b-[1px] py-1">
              <h1 className="col-span-1 font-bold">Клиент:</h1>
              <span className="col-span-2">{orderData?.client_name}</span>
            </li>
            <li className="text-thin-secondary grid grid-cols-3 border-b-[1px] py-1">
              <h1 className="col-span-1 font-bold">Номер телефона:</h1>
              <span className="col-span-2">{orderData?.phone}</span>
            </li>
            <li className="text-thin-secondary grid grid-cols-3 border-b-[1px] py-1">
              <h1 className="col-span-1 font-bold">Доставщик:</h1>
              <span className="col-span-2">{orderData?.deliver_name}</span>
            </li>
            <li className="text-thin-secondary grid grid-cols-3 border-b-[1px] py-1">
              <h1 className="col-span-1 font-bold">Статус заказ :</h1>
              <span className="col-span-2">
                {
                  statusData.find((item) => item.status === orderData?.status)
                    ?.title
                }
              </span>
            </li>
            <li className="text-thin-secondary grid grid-cols-3 border-b-[1px] py-1">
              <h1 className="col-span-1 font-bold">Тип оплаты: </h1>
              <span className="col-span-2">{orderData?.payment_method}</span>
            </li>
            <li className="text-thin-secondary grid grid-cols-3 border-b-[1px] py-1">
              <h1 className="col-span-1 font-bold">Адрес:</h1>
              <span className="col-span-2">{orderData?.address}</span>
            </li>
          </ul>
        </div>
        <OrderCheck
          discount={discounts}
          orderData={orderData}
          products={orderData?.products.length > 0 ? orderData?.products : []}
          deliveryPrice={orderData?.delivery_price}
        />
      </section>
    </Container>
  );
};

export default OrderDetails;

const OrderCheck = ({ orderData, products, deliveryPrice, discount }) => {
  return (
    <main className="col-span-1 shadow-custom p-4 rounded-md flex justify-between items-start flex-col">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-thin px-2 textSmall1 py-1 text-left">
              Наименование
            </th>
            <th className="text-thin px-2 textSmall1 py-1 text-center">
              Кол-во
            </th>
            <th className="text-thin px-2 textSmall1 py-1 text-right">Цена</th>
            <th className="text-thin px-2 textSmall1 py-1 text-right">Итого</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((item, index) => {
            const productDiscount = discount?.find(
              (d) => d.promotion_id == item.promotion_id
            );

            const renderRow = (name, count, price) => {
              let prs;
              if (productDiscount?.params?.result_type == 2) {
                prs = Math.max(
                  0,
                  price - productDiscount.params.discount_value
                );
              } else if (productDiscount?.params?.result_type == 3) {
                prs =
                  (price * (100 - productDiscount.params.discount_value)) / 100;
              } else {
                prs = price;
              }
              return (
                <tr key={`${index}-${name}`} className="border-b">
                  <td className="text-foreground px-2 py-1 textSmall2 text-left">
                    {name}
                  </td>
                  <td className="text-thin px-2 py-1 textSmall2 text-center">
                    {count}
                  </td>
                  <td className="text-thin px-2 py-1 textSmall2 text-right">
                    <h1 className=""> {prs} </h1>
                    {productDiscount && (
                      <p className="textSmall1 line-through">{price} </p>
                    )}
                    сум
                  </td>
                  <td className="text-thin px-2 py-1 textSmall2 text-right">
                    <h1>{prs * count}</h1>
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
                Number(item?.price)
              );
            }
          })}
        </tbody>
      </table>
      <ul className="w-full textSmall2 space-y-2 mt-4 text-thin">
        <li className="flex justify-between items-center gap-3">
          <h1 className="col-span-1">Сумма доставки:</h1>
          <span className="col-span-2">{deliveryPrice} сум</span>
        </li>
        <li className="font-bold flex justify-between items-center gap-3">
          <h1 className="col-span-1">Сумма заказа:</h1>
          <span className="col-span-2">{orderData?.total} сум</span>
        </li>
      </ul>
    </main>
  );
};
