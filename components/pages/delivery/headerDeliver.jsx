import DotInput from "@/components/shared/dot-input";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import NotificationModal from "./NotificationModal";

const HeaderDeliver = ({ time, authData, pathname }) => {
  const [locationShared, setLocationShared] = useState(false);

  useEffect(() => {
    // Agar location ulashish ruxsat berilgan bo'lsa, bu yerda tekshirishni amalga oshirishingiz mumkin
    navigator.geolocation.getCurrentPosition(
      () => setLocationShared(true),
      () => setLocationShared(false)
    );
  }, []);

  const handleLocationPermission = () => {
    if (!locationShared) {
      // Ruxsatni olish uchun foydalanuvchini geolocationning sozlamalariga yo'naltirish
      alert(
        "Для работы с приложением разрешите доступ к вашему местоположению в настройках браузера."
      );
      // Odatda foydalanuvchilar ruxsatni brauzer sozlamalaridan qo'lda o'zgartiradilar
    }
  };

  return (
    <div
      className={`${
        pathname.includes("/admin")
          ? "hidden"
          : "flex justify-between items-center"
      } h-20 mx-auto w-full relative`}
    >
      <div className="w-11/12 mx-auto flex justify-between items-center gap-2">
        <Link
          href="/delivery"
          className="flex justify-start items-center gap-2"
        >
          <DotInput checked="checked" />
          <h1 className="text-md font-bold text-white">WASSABI DELIVERY</h1>
        </Link>
        <div className="flex justify-end items-center">
          <p className="text-2xl font-medium text-white">
            {time ? time : "00:00"}
          </p>
          <NotificationModal authData={authData} />
        </div>
      </div>
      <div
        className={`absolute left-0 -bottom-2 textSmall1 flex justify-center items-center w-full text-center py-1 ${
          locationShared ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}
      >
        {locationShared ? (
          "Местоположение делится..."
        ) : (
          <>
            <span>Пожалуйста, разрешите доступ к вашему местоположению</span>
            <button
              onClick={handleLocationPermission}
              className="ml-2 bg-yellow-400 text-white rounded px-2 py-[1px] textSmall1"
            >
              Разрешить
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default HeaderDeliver;
