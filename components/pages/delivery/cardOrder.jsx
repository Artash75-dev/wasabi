import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronRight, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { statusData } from "@/lib/iterationDetails";
import { formatCreationTime, truncateText } from "@/lib/functions";
import toast from "react-hot-toast";
import useAudio from "@/hooks/use-audio";

export default function DeliveryCardOrder({ data }) {
  const { playSound } = useAudio();

  const {
    _id,
    status,
    client_name,
    address,
    transaction_id,
    _creationTime,
    order_num,
    delivery_time,
  } = data;

  const orderColors = {
    created: "text-blue-600 bg-blue-100 hover:bg-blue-200",
    waiting: "text-orange-600 bg-orange-100 hover:bg-orange-200",
    cooking: "text-indigo-600 bg-indigo-100 hover:bg-indigo-200",
    "in-deliver": "text-sky-600 bg-sky-100 hover:bg-sky-200",
    finished: "text-green-600 bg-green-100 hover:bg-green-200",
    cancelled: "text-red-600 bg-red-100 hover:bg-red-200",
  };

  const colorClasses =
    orderColors[status] || "text-gray-600 bg-gray-100 hover:bg-gray-200";

  const [timeLeft, setTimeLeft] = useState(delivery_time - Date.now());
  const [backgroundColor, setBackgroundColor] = useState("bg-white");

  const formatTime = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  const calculateOrderItemBackgroundColor = (remainingTime) => {
    if (remainingTime <= 1) return "rgba(255, 0, 0, 1)"; // Red when time is up
    if (remainingTime > 600000) return "#F7F8FA"; // Default color
    const intensity = Math.min(1, (600000 - remainingTime) / 600000);
    return `rgba(255, 0, 0, ${intensity})`; // Red with decreasing intensity
  };

  const calculateOrderColorTextColor = (remainingTime) => {
    if (remainingTime <= 1) return "rgba(255, 255, 255, 1)"; // White text when time is up
    if (remainingTime > 600000) return "rgba(0, 0, 0, 1)"; // Default text color
    const intensity = Math.min(1, (600000 - remainingTime) / 600000);
    return `#ffffff`; // White text with decreasing intensity
  };

  useEffect(() => {
    const resetColors = () => {
      const orderItemDiv = document.getElementById(`order-item-${_id}`);
      const orderColorDiv = document.getElementById(`order-color-${_id}`);
      if (orderItemDiv) {
        orderItemDiv.style.transition = "background-color 1s ease";
        orderItemDiv.style.backgroundColor = "#FFFFFF"; // Default color
      }

      if (orderColorDiv) {
        orderColorDiv.style.transition = "color 1s ease";
        orderColorDiv.style.color = "rgba(0, 0, 0, 1)"; // Default text color
      }
    };

    if (status === "in-deliver") {
      // Update time every second
      const interval = setInterval(() => {
        const remainingTime = delivery_time - Date.now();
        setTimeLeft(remainingTime);

        const orderItemDiv = document.getElementById(`order-item-${_id}`);
        const orderColorDiv = document.getElementById(`order-color-${_id}`);

        if (orderItemDiv) {
          orderItemDiv.style.transition = "background-color 1s ease";
          orderItemDiv.style.backgroundColor =
            calculateOrderItemBackgroundColor(remainingTime);
        }

        if (orderColorDiv) {
          orderColorDiv.style.transition = "color 1s ease";
          orderColorDiv.style.color =
            calculateOrderColorTextColor(remainingTime);
        }

        if (remainingTime == 5 * 60 * 1000 || remainingTime <= 0) {
          playSound("notification.mp3");
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start justify-center">
                  <div>
                    <TriangleAlert size={32} className="text-red-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Предупреждение
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Заказ
                      <span className="text-red-400 text-md">
                        {" "}
                        №{order_num}
                      </span>{" "}
                      задерживается!!!
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <Link
                  href={`/delivery/${_id}`}
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Открытие
                </Link>
              </div>
            </div>
          ));
        }

        if (remainingTime <= 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      resetColors();
    }
  }, [delivery_time, status, _id]);

  return (
    <Card
      id={`order-item-${_id}`}
      className={`w-full shadow-md ${backgroundColor}`}
    >
      <CardHeader className="space-y-4">
        <CardTitle>
          <Link href={`/delivery/${_id}`} className="flex justify-between">
            <span className="textNormal4">Заказ № {order_num}</span>
            <ChevronRight className="text-gray-400" />
          </Link>
        </CardTitle>
        <CardDescription
          id={`order-color-${_id}`}
          className="flex flex-col gap-3 text-thin-secondary"
        >
          <div className="flex justify-between items-center textSmall2">
            <h1 className="w-1/2">Номер чека:</h1>
            <p className="w-1/2 text-end">{transaction_id}</p>
          </div>
          <div className="flex justify-between items-center textSmall2">
            <h1 className="w-1/2">Клиент :</h1>
            <p className="w-1/2 text-end">{truncateText(client_name, 20)}</p>
          </div>
          <div className="flex justify-between items-center textSmall2">
            <h1 className="w-1/2">Адрес:</h1>
            <p className="w-1/2 text-end">{truncateText(address, 70)}</p>
          </div>
          <div className="flex justify-between items-center textSmall2">
            <h1 className="w-1/2">Время создания:</h1>
            <p className="w-1/2 text-end">
              {formatCreationTime(_creationTime)}
            </p>
          </div>
          {delivery_time && (
            <div className="flex justify-between items-center textSmall2">
              <h1 className="w-1/2">Время доставки:</h1>
              <p className="w-1/2 text-end">
                {formatCreationTime(delivery_time)}
              </p>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2 justify-between items-center">
        {status === "in-deliver" && (
          <h2 className="text-xl font-bold">{formatTime(timeLeft)}</h2>
        )}
        <Button
          className={`h-0 py-4 flex justify-center items-center rounded-full text-[12px] font-bold ${colorClasses}`}
        >
          {statusData.find((item) => item.status === status)?.title}
        </Button>
      </CardContent>
    </Card>
  );
}
