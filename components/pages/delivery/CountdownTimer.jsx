import { TriangleAlert } from "lucide-react";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const CountdownTimer = ({ deliveryTime, status, order_num }) => {
  const [timeLeft, setTimeLeft] = useState(deliveryTime - Date.now());

  useEffect(() => {
    const resetColors = () => {
      const orderItemDiv = document.getElementById("order-item");
      const orderColorDiv = document.getElementById("order-color");
      if (orderItemDiv) {
        orderItemDiv.style.transition = "background-color 1s ease";
        orderItemDiv.style.backgroundColor = "#F7F8FA"; // Default color
      }

      if (orderColorDiv) {
        orderColorDiv.style.transition = "color 1s ease";
        orderColorDiv.style.color = "rgba(0, 0, 0, 1)"; // Default text color
      }
    };

    if (status === "in-deliver") {
      // Vaqtni har soniyada yangilash
      const interval = setInterval(() => {
        const remainingTime = deliveryTime - Date.now();
        setTimeLeft(remainingTime);

        const orderItemDiv = document.getElementById("order-item");
        const orderColorDiv = document.getElementById("order-color");

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
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Close
                </button>
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
      // Reset the colors when status is not "in-deliver"
      resetColors();
    }
  }, [deliveryTime, status]);

  const formatTime = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  const calculateOrderItemBackgroundColor = (remainingTime) => {
    if (remainingTime <= 0) return "rgba(255, 0, 0, 1)";
    if (remainingTime > 600000) return "#F7F8FA";
    const intensity = Math.min(1, (600000 - remainingTime) / 600000);
    return `rgba(255, 0, 0, ${intensity})`;
  };

  const calculateOrderColorTextColor = (remainingTime) => {
    if (remainingTime <= 0) return "rgba(255, 255, 255, 1)";
    if (remainingTime > 600000) return "rgba(0, 0, 0, 1)";
    const intensity = Math.min(1, (600000 - remainingTime) / 600000);
    return `#ffffff`;
  };

  return <h2 className="text-xl font-bold"> {formatTime(timeLeft)}</h2>;
};

export default CountdownTimer;
