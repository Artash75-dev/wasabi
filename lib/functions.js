"use client";

import { Check, CircleX } from "lucide-react";
import toast from "react-hot-toast";
import { IoMdNotificationsOutline } from "react-icons/io";
import Cookies from "js-cookie";
import axios from "axios";
import Loader from "@/components/shared/loader";
import { io } from "socket.io-client";
import { toast as toastSunner } from "sonner";

// Apply backdrop blur and block body scrolling and interaction
const applyWhiteBackground = () => {
  const backdrop = document.createElement("div");
  backdrop.classList.add("toast-backdrop");
  backdrop.setAttribute("id", "toast-backdrop");
  document.body.appendChild(backdrop);

  // Block body scrolling and interaction
  document.body.classList.add("body-blocked");
};

// Remove backdrop and restore body interaction
const removeWhiteBackground = () => {
  const backdrop = document.getElementById("toast-backdrop");
  if (backdrop) {
    document.body.removeChild(backdrop);
  }
  // Unblock body scrolling and interaction
  document.body.classList.remove("body-blocked");
};

const roundToTwoDecimals = (value) => {
  return Number((Math.round(value * 100) / 100).toFixed(2));
};

const showNewOrderToast = (data, authorization) => {
  const {
    total,
    phone,
    payment_method,
    _creationTime,
    client_name,
    address,
    order_num,
    transaction_id,
    delivery_time,
  } = data;
  let loading = false;
  let loadingCancel = false;
  applyWhiteBackground();
  const socket = io();

  toast(
    (t) => (
      <main className="w-11/12 mx-auto flex gap-5 flex-col">
        <section className="space-y-6">
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="font-bold text-primary text-xl">Новый заказ</h1>
              <p className="text-thin text-sm">Доступен новый заказ</p>
            </div>
            <button>
              <IoMdNotificationsOutline className="text-primary text-5xl" />
            </button>
          </div>
          <ul className="space-y-3">
            <li className="w-full flex justify-between items-center gap-2">
              <span className="w-[50%] text-start font-medium text-sm">
                Номер заказа:
              </span>
              <span className="w-[50%] text-start font-medium text-sm">
                №{order_num}
              </span>
            </li>
            <li className="w-full flex justify-between items-center gap-2">
              <span className="w-[50%] text-start font-medium text-sm">
                Номер чека:
              </span>
              <span className="w-[50%] text-start font-medium text-sm">
                {transaction_id}
              </span>
            </li>
            <li className="w-full flex justify-between items-center gap-2">
              <span className="w-[50%] text-start font-medium text-sm">
                Сумма заказа:
              </span>
              <span className="w-[50%] text-start font-medium text-sm">
                {total} сум
              </span>
            </li>
            <li className="w-full flex justify-between items-center gap-2">
              <span className="w-[50%] text-start font-medium text-sm">
                Оплата:
              </span>
              <span className="w-[50%] text-start font-medium text-sm">
                {payment_method}
              </span>
            </li>
            <li className="w-full flex justify-between items-center gap-2">
              <span className="w-[50%] text-start font-medium text-sm">
                Оплата:
              </span>
              <span className="w-[50%] text-start font-medium text-sm text-red-500">
                Не оплачено
              </span>
            </li>
            <li className="w-full flex justify-between items-center gap-2">
              <span className="w-[50%] text-start font-medium text-sm">
                Время доставки:
              </span>
              <span className="w-[50%] text-start font-medium text-sm">
                {formatCreationTime(delivery_time)}
              </span>
            </li>
            <li className="w-full flex justify-between items-center gap-2">
              <span className="w-[50%] text-start font-medium text-sm">
                Клиент:
              </span>
              <span className="w-[50%] text-start font-medium text-sm">
                {phone} {client_name}
              </span>
            </li>
            <li className="w-full flex justify-between items-center gap-2">
              <span className="w-[50%] text-start font-medium text-sm">
                Адрес:
              </span>
              <span className="w-[50%] text-start font-medium text-sm">
                {truncateText(address, 60)}
              </span>
            </li>
          </ul>
        </section>
        <div className="flex justify-between items-center gap-3">
          <button
            className="w-full border rounded-md px-2 py-1 flex justify-start items-center gap-2 text-primary"
            onClick={async () => {
              loading = true;
              try {
                const res = await axios.patch("/api/order", {
                  _id: data?._id,
                  status: "in-deliver",
                  deliver_name: authorization?.login,
                });
                if (res) {
                  toastSunner.success("Заказ принят!", {
                    duration: 2000,
                  });
                  removeWhiteBackground();
                  toast.dismiss(t.id);
                  if (data?.chat_id !== 0) {
                    socket.emit("order-status", {
                      chat_id: data?.chat_id,
                      order_status: "in-deliver",
                    });
                  }
                }
              } catch (error) {
                toastSunner.error("Заказ не был принят!!!", {
                  duration: 2000,
                });
              } finally {
                loading = false;
              }
            }}
          >
            {loading ? <Loader /> : <Check />}
            <span className="font-medium text-sm">Принять</span>
          </button>
          <button
            className="w-full border rounded-md px-2 py-1 flex justify-start items-center gap-2 text-red-500"
            onClick={async () => {
              loadingCancel = true;
              try {
                await axios.patch("/api/order", {
                  _id: data?._id,
                  status: "cooking",
                  deliver_id: 0,
                  deliver_name: "",
                });

                socket.emit("cancelSend", {
                  incoming_order_id: data?.incoming_order_id,
                  transaction_id: data?.transaction_id,
                  deliver_id: data?.deliver_id,
                  spot_id: data?.spot_id,
                });

                toastSunner.error("Заказ отменен!", {
                  duration: 2000,
                });
                removeWhiteBackground();
                toast.dismiss(t.id);
              } catch (error) {
                toastSunner.error("Заказ не был отменен!!!", {
                  duration: 2000,
                });
              } finally {
                loadingCancel = false;
              }
            }}
          >
            {loadingCancel ? <Loader /> : <CircleX />}
            <span className="font-medium text-sm">Отклонить</span>
          </button>
        </div>
      </main>
    ),
    {
      duration: Infinity,
      containerClassName: "w-full",
      style: {
        minWidth: "100%",
      },
    }
  );
};

const showErrorOrderToast = () => {
  applyWhiteBackground();
  toast(
    (t) => (
      <main className="w-11/12 mx-auto flex gap-5 flex-col">
        <div className="flex justify-between items-center w-full">
          <div className="space-y-2">
            <h1 className="font-medium text-red-500 text-md">
              Истекает время доставки заказа № 202
            </h1>
            <p className="text-thin text-sm">
              Внимание истекает время доставки, поторопитесь
            </p>
          </div>
          <button>
            <IoMdNotificationsOutline className="text-red-500 text-5xl" />
          </button>
        </div>
        <div className="flex justify-end items-center gap-3">
          <button
            className="border rounded-md px-2 py-1 flex justify-start items-center gap-2 text-red-500"
            onClick={() => {
              removeWhiteBackground();
              toast.dismiss(t.id);
            }}
          >
            <CircleX />
            <span className="font-medium text-sm">Подробно</span>
          </button>
        </div>
      </main>
    ),
    {
      duration: Infinity,
      containerClassName: "w-full",
      style: {
        minWidth: "100%",
      },
    }
  );
};
const AdminNewOrderToast = (count) => {
  toast(
    (t) => (
      <main className="w-11/12 mx-auto flex gap-5 flex-col">
        <div className="flex justify-between items-center w-full">
          <div className="space-y-2">
            <h1 className="font-bold text-primary text-md">
              У вас есть заказы, поступившие от бота.
            </h1>
            <p className="text-thin text-sm">
              Количество новых заказов {count}
            </p>
          </div>
          <button>
            <IoMdNotificationsOutline className="text-primary text-5xl" />
          </button>
        </div>
      </main>
    ),
    {
      duration: 3000,
    }
  );
};
const exitToast = () => {
  applyWhiteBackground();
  toast(
    (t) => (
      <main className="w-11/12 mx-auto flex gap-5 flex-col">
        <div className="flex flex-col gap-2 justify-between items-center w-full">
          <div className="space-y-2">
            <h1 className="font-medium text-red-500 text-md">
              Вы уверены, что хотите выйти?
            </h1>
          </div>
        </div>
        <div className="w-full flex justify-between items-center gap-3">
          <button
            className="border rounded-md px-2 py-1 flex justify-start items-center gap-2 text-primary"
            onClick={() => {
              toast.dismiss(t.id);
              Cookies.remove("auth");
              window.location.replace("/login");
            }}
          >
            <Check />
            <span className="font-medium text-sm">Да</span>
          </button>
          <button
            className="border rounded-md px-2 py-1 flex justify-start items-center gap-2 text-red-500"
            onClick={() => {
              removeWhiteBackground();
              toast.dismiss(t.id);
            }}
          >
            <CircleX />
            <span className="font-medium text-sm">Нет</span>
          </button>
        </div>
      </main>
    ),
    {
      duration: Infinity,
      containerClassName: "w-full",
      style: {
        minWidth: "100%",
      },
    }
  );
};

const checkStatus = (status) => {
  switch (status) {
    case "expected":
      return "text-blue-600 bg-blue-100";
    case "completed":
      return "text-green-600 bg-green-100";
    case "progress":
      return "text-orange-600 bg-orange-100";
    case "delivered":
      return "text-indigo-600 bg-indigo-100";
    case "urgent":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-500 bg-gray-100";
  }
};

function formatCreationTime(timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const year = date.getFullYear();

  return `${hours}:${minutes}, ${year}.${month}.${day}`;
}

function truncateText(text, maxLength) {
  if (text?.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
}

const filterOrdersByTimeRange = (orders, timeRange) => {
  const now = new Date();

  // Get the start of today (midnight)
  const startOfToday = new Date(now.setHours(0, 0, 0, 0)).getTime();

  // Get the end of today (just before midnight of the next day)
  const endOfToday = new Date(now.setHours(23, 59, 59, 999)).getTime();

  switch (timeRange) {
    case "1d":
      return orders.filter((order) => {
        const orderTime = new Date(order._creationTime).getTime();
        return orderTime >= startOfToday && orderTime <= endOfToday; // Only today's orders
      });

    case "7d":
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7)).getTime(); // 1 week ago
      return orders.filter(
        (order) => new Date(order._creationTime).getTime() >= sevenDaysAgo
      );

    case "30d":
      const thirtyDaysAgo = new Date(
        now.setMonth(now.getMonth() - 1)
      ).getTime(); // 1 month ago
      return orders.filter(
        (order) => new Date(order._creationTime).getTime() >= thirtyDaysAgo
      );

    case "90d":
      const ninetyDaysAgo = new Date(
        now.setMonth(now.getMonth() - 3)
      ).getTime(); // 3 months ago
      return orders.filter(
        (order) => new Date(order._creationTime).getTime() >= ninetyDaysAgo
      );

    default:
      return orders; // No filtering if no valid range
  }
};

function formatNumber(num) {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

export {
  exitToast,
  checkStatus,
  showErrorOrderToast,
  showNewOrderToast,
  formatCreationTime,
  AdminNewOrderToast,
  truncateText,
  roundToTwoDecimals,
  filterOrdersByTimeRange,
  formatNumber,
};
