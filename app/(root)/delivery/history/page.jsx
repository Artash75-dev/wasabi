"use client";

import DeliveryCardOrder from "@/components/pages/delivery/cardOrder";
import Container from "@/components/shared/container";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Cookies from "js-cookie";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const History = () => {
  const auth = Cookies.get("auth");
  const [orderData, setOrderData] = useState([]);
  const router = useRouter();

  const authorization = auth ? JSON.parse(auth) : null;
  const user_id = authorization?.user_id;

  const filterOrder = useQuery(api.order.getByDeliverId, {
    deliver_id: user_id ? user_id : null,
  });

  useEffect(() => {
    if (filterOrder?.length > 0) {
      setOrderData(filterOrder.filter((order) => order?.status == "finished"));
    } else {
      setOrderData([]);
    }
  }, [filterOrder]);

  return (
    <Container className="flex flex-col gap-2 max-w-2xl mx-auto justify-start items-start w-11/12 pt-24 pb-[150px]">
      <Link
        href="/delivery"
        className="cursor-pointer flex justify-start items-center gap-2"
      >
        <div className="cursor-pointer">
          <ChevronLeft size={32} className="text-primary border rounded-md" />
        </div>
        <h1 className="font-bold text-xl text-primary text-start">История</h1>
      </Link>
      <div className="flex flex-col gap-4">
        {orderData.map((item, idx) => (
          <Link href={`/delivery/${item?._id}`} key={item.id || idx}>
            <DeliveryCardOrder data={item} />
          </Link>
        ))}
      </div>
    </Container>
  );
};

export default History;
