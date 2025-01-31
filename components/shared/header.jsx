"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import NextTopLoader from "nextjs-toploader";
import HeaderAdmin from "../pages/admin/headerAdmin";
import HeaderDeliver from "../pages/delivery/headerDeliver";
import useProductStore, { deliveryStore } from "@/store/event";
import axios from "axios";
import { StarHalf } from "lucide-react";
import { useSocketDeliverContext } from "@/providers/SocketDeliverContext";

export default function Header() {
  const { socket } = useSocketDeliverContext();
  const auth = Cookies.get("auth");
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const [customColor, setCustomColor] = useState();
  const [authData, setAuthData] = useState(null);
  const { setDiscounts } = useProductStore();
  const { setDiscountDelivery } = deliveryStore();
  const authorization = auth ? JSON.parse(auth) : null;

  useEffect(() => {
    const updateClock = () => {
      const current = new Date();
      const hours = String(current.getHours()).padStart(2, "0");
      const minutes = String(current.getMinutes()).padStart(2, "0");
      setTime(`${hours}:${minutes}`);
    };
    if (auth) {
      setAuthData(JSON.parse(auth)); // Parse JSON string if it's a JSON object
    }

    updateClock();
    const intervalId = setInterval(updateClock, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (pathname.includes("/admin")) {
      setCustomColor("hsla(83, 83%, 32%, 1)");
    } else {
      setCustomColor("hsla(0, 0%, 100%, 1)");
    }
  }, [pathname]);

  useEffect(() => {
    if (authorization) {
      const { user_id, role, name, login } = authorization;
      if (role == "delivery") {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("sending");
            sendLocation(latitude, longitude);
          },
          (error) => console.error(error),
          { enableHighAccuracy: true }
        );
        function sendLocation(latitude, longitude) {
          socket?.emit("updateLocation", {
            lat: latitude,
            lng: longitude,
            deliver_id: user_id,
            name,
            email: login,
          });
        }

        return () => {
          navigator.geolocation.clearWatch(watchId);
          socket?.disconnect();
        };
      }
    }
  }, [socket]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/discount");
        const discountProducts = localStorage.getItem("discountProducts")
          ? JSON.parse(localStorage.getItem("discountProducts"))
          : [];
        const promotions = res?.data?.data;
        setDiscountDelivery(promotions);

        console.log(res);

        let filterPromotions = promotions?.filter((prom) => {
          const nowDate = new Date(); // Hozirgi sana va vaqt
          const startDate = new Date(prom.date_start); // Sana boshlanishi
          const endDate = new Date(prom.date_end); // Sana tugashi

          // Haftani moslashtirish (0 = Dushanba, 6 = Yakshanba)
          const adjustedWeekDay = (nowDate.getDay() + 6) % 7;

          // Sana bo'yicha tekshiruv
          const isDateValid = startDate <= nowDate && nowDate <= endDate;

          // Period bo'yicha tekshiruv
          const isPeriodValid = prom?.params?.periods?.some((period) => {
            const [startHour, startMinute] = period.start
              .split(":")
              .map(Number); // "11:00" => [11, 00]
            const [endHour, endMinute] = period.end.split(":").map(Number); // "23:00" => [23, 00]

            const startTime = new Date(nowDate);
            startTime.setHours(startHour, startMinute, 0, 0);

            const endTime = new Date(nowDate);
            endTime.setHours(endHour, endMinute, 0, 0);

            return nowDate >= startTime && nowDate <= endTime; // Hozirgi vaqt period ichida
          });

          // Hafta kuni bo'yicha tekshiruv
          const isWeekDayValid =
            prom?.params?.week_days &&
            prom.params.week_days[adjustedWeekDay] === "1";

          // Uchala shart bajarilishi kerak
          return isDateValid && isPeriodValid && isWeekDayValid;
        });
        filterPromotions = filterPromotions.map((fpr) => {
          const findDiscount = discountProducts?.find(
            (ds) => ds?.discount?.promotion_id == fpr?.promotion_id
          );

          if (findDiscount) {
            return {
              ...fpr,
              active: true,
            };
          } else {
            return fpr;
          }
        });
        console.log(filterPromotions, "discount");
        if (filterPromotions) {
          setDiscounts(filterPromotions);
        }
      } catch (error) {}
    };
    fetchData();
  }, []);

  return (
    <>
      <NextTopLoader
        color={customColor}
        crawlSpeed={200}
        height={3}
        crawl={true}
        showSpinner={true}
        easing="ease"
        speed={200}
        template='<div class="bar" role="bar"><div class="peg"></div></div> <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
        zIndex={999999999}
        showAtBottom={false}
      />
      <main
        className={`${
          pathname.includes("/delivery")
            ? "bg-primary "
            : "bg-background border"
        } shadow-sm fixed top-0 left-0 w-full z-[400]`}
      >
        {pathname.includes("/admin") && (
          <HeaderAdmin authData={authData} pathname={pathname} />
        )}
        {pathname.includes("/delivery") && (
          <HeaderDeliver time={time} authData={authData} pathname={pathname} />
        )}
      </main>
    </>
  );
}
