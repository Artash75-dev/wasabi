"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import OrderDialog from "./orderDialog";
import useProductStore, { orderCreateInfo, useEvent } from "@/store/event";
import Check from "./check";
import Client from "./client";
import Discount from "./discount";
import axios from "axios";

export default function SideBarOrder({
  categoryData,
  productsData,
  orderSources,
}) {
  const [loading, setIsLoading] = useState(true);
  const {
    products,
    initializeProducts,
    initializeDiscounts,
    initializeDiscountProducts,
  } = useProductStore();
  const { orderData } = orderCreateInfo();
  const { setClients } = useEvent();
  const { activeTab, setActiveTab } = useEvent();
  const [countDics, setCountDics] = useState(0);
  
  const orderListData = [
    {
      id: 1,
      title: "Чек",
    },
    {
      id: 2,
      title: "Клиент",
    },
    {
      id: 3,
      title: "Акции",
    },
  ];

  const customComponent = (id) => {
    switch (id) {
      case 1:
        return (
          <Check
            products={products}
            categoryData={categoryData}
            productsData={productsData}
          />
        );
      case 2:
        return <Client loading={loading} />;
      case 3:
        return <Discount />;
      default:
        return null;
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const client = await axios.get("/api/client");
        setClients(client.data);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    })();
    initializeProducts();
    initializeDiscountProducts();
    initializeDiscounts();
  }, []);

  return (
    <div className="col-span-2 relative flex justify-start items-start">
      <aside className="sticky top-20 left-0 h-[calc(100dvh-80px)] w-full space-y-4 py-4">
        <section className="w-full flex items-center gap-6 shadow-custom rounded-md p-2">
          {orderListData.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`${
                activeTab === item.id ? "text-white" : "text-thin"
              } transition-all duration-300 ease-linear w-[33%] rounded-[6px] font-bold cursor-pointer relative py-1 flex justify-center items-center gap-[8px]`}
            >
              <h1 className="relative z-10 textSmall2">{item.title}</h1>

              {item?.id == 2 && (
                <>
                  {orderData?.status == "bot" && (
                    <div className="z-[100] textSmall1 top-0 right-2 text-black">
                      через бота
                    </div>
                  )}
                </>
              )}
              {item.id === 3 && countDics !== 0 && (
                <p className="absolute -top-1 -right-1 w-4 h-4 textSmall1 text-center rounded-full z-10 flex justify-center items-center text-white bg-red-500">
                  {countDics}
                </p>
              )}
              {activeTab === item.id && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-primary rounded-[6px]"
                />
              )}
            </div>
          ))}
        </section>
        {/* Fixed overflow logic */}
        <section className="shadow-custom rounded-t-lg pt-1">
          <div className="overflow-y-auto h-[calc(100vh-250px)]">
            {customComponent(activeTab)}
          </div>
        </section>
        <OrderDialog
          orderSources={orderSources}
          categoryData={categoryData}
          productsData={productsData}
        />
      </aside>
    </div>
  );
}
