"use client";

import Container from "@/components/shared/container";
import { exitToast } from "@/lib/functions";
import Cookies from "js-cookie";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ImExit } from "react-icons/im";

const Settings = () => {
  const router = useRouter();
  const auth = Cookies.get("auth");
  const [userData, setUserData] = useState();
  const handleBack = () => {
    router.back();
  };
  useEffect(() => {
    if (auth) {
      setUserData(JSON.parse(auth));
    }
  }, [auth]);

  return (
    <Container className="flex flex-col max-w-2xl gap-4 mx-auto justify-start items-start w-11/12 pt-24 pb-[150px]">
      {/* Sarlavha bo'limi */}
      <Link
        href="/delivery"
        className="cursor-pointer flex justify-start items-center gap-2"
      >
        <div className="cursor-pointer">
          <ChevronLeft size={32} className="text-primary border rounded-md" />
        </div>
        <h1 className="font-bold text-xl text-primary text-start">Настройки</h1>
      </Link>

      {/* Sozlamalar tarkibi */}
      <section className="w-full space-y-4">
        <div className="flex justify-between items-center gap-2 border-b pb-4">
          <h2 className="font-semibold text-lg text-gray-600">Имя</h2>
          <p className="text-gray-800">{userData?.name || "Имя не задано"}</p>
        </div>
        <div className="flex justify-between items-center gap-2 border-b pb-4">
          <h2 className="font-semibold text-lg text-gray-600">Email</h2>
          <p className="text-gray-800">{userData?.login || "Email не задан"}</p>
        </div>

        {/* Oldingi zakazlarni ko'rish */}
        <div className="flex justify-between items-center gap-2 border-b pb-4">
          <h2 className="font-semibold text-lg text-gray-600">
            Предыдущие заказы
          </h2>
          <Link
            href="/delivery/history"
            className="text-primary hover:underline"
          >
            Посмотреть
          </Link>
        </div>

        {/* Chiqish tugmasi */}
        <div
          onClick={exitToast}
          className="p-4 bg-red-600 rounded-full flex justify-center items-center cursor-pointer hover:bg-red-700 transition duration-200"
        >
          <ImExit className="text-2xl text-white" />
        </div>
      </section>
    </Container>
  );
};

export default Settings;
