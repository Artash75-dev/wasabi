"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Check, CircleX } from "lucide-react";
import { useState } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import { motion } from "framer-motion";

export default function NewOrderDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open dialog</button>
      {isOpen && (
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 flex mt-20 items-start justify-center px-4 bg-white/50">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <DialogPanel className="max-w-lg space-y-4 border bg-white p-2">
                <main className="w-11/12 mx-auto flex gap-5 flex-col">
                  <section className="space-y-6">
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <h1 className="font-medium text-primary text-xl">
                          Новый заказ
                        </h1>
                        <p className="text-thin text-sm">
                          Доступен новый заказ
                        </p>
                      </div>
                      <button className="">
                        <IoMdNotificationsOutline className="text-primary text-5xl" />
                      </button>
                    </div>
                    <ul className="space-y-3">
                      <li className="w-full flex justify-between items-center gap-2">
                        <span className="w-[50%] text-start font-medium text-sm">
                          Номер заказа:
                        </span>
                        <span className="w-[50%] text-start font-medium text-sm">
                          №201
                        </span>
                      </li>
                      <li className="w-full flex justify-between items-center gap-2">
                        <span className="w-[50%] text-start font-medium text-sm">
                          Сумма заказа:
                        </span>
                        <span className="w-[50%] text-start font-medium text-sm">
                          106 000 сум
                        </span>
                      </li>
                      <li className="w-full flex justify-between items-center gap-2">
                        <span className="w-[50%] text-start font-medium text-sm">
                          Оплата:
                        </span>
                        <span className="w-[50%] text-start font-medium text-sm">
                          Наличкой
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
                          16:30
                        </span>
                      </li>
                      <li className="w-full flex justify-between items-center gap-2">
                        <span className="w-[50%] text-start font-medium text-sm">
                          Клиент:
                        </span>
                        <span className="w-[50%] text-start font-medium text-sm">
                          +99899 999-99-99 Юнусов Шоислом
                        </span>
                      </li>
                      <li className="w-full flex justify-between items-center gap-2">
                        <span className="w-[50%] text-start font-medium text-sm">
                          Адрес:
                        </span>
                        <span className="w-[50%] text-start font-medium text-sm">
                          Яшнабадский рн. ул. Боткина дом 5
                        </span>
                      </li>
                    </ul>
                  </section>
                  <div className="flex justify-between items-center gap-3">
                    <button
                      className="w-full border rounded-md px-2 py-1 flex justify-start items-center gap-2 text-primary"
                      onClick={() => {
                      }}
                    >
                      <Check />
                      <span className="font-medium text-sm">Принять</span>
                    </button>
                    <button
                      className="w-full border rounded-md px-2 py-1 flex justify-start items-center gap-2 text-red-500"
                      onClick={() => setIsOpen(false)}
                    >
                      <CircleX />
                      <span className="font-medium text-sm">Отклонить</span>
                    </button>
                  </div>
                </main>
              </DialogPanel>
            </motion.div>
          </div>
        </Dialog>
      )}
    </>
  );
}
