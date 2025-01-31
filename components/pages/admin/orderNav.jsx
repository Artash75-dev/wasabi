"use clinet";

import { motion } from "framer-motion";
import { orderStatusData, statusData } from "@/lib/iterationDetails";
import Link from "next/link";
import SearchComponent from "@/components/shared/searchComponent";
export default function NavOrder({ status }) {
  return (
    <main className="w-full flex justify-between items-center gap-3">
      <div className="w-full flex items-center gap-6">
        {orderStatusData.map((item,idx) => (
          <Link
            href={{ pathname: "all", query: { status: item.status } }}
            key={idx}
            className={`${
              status === item.status ? "text-primary" : "text-thin-secondary"
            }  rounded-[6px] font-bold cursor-pointer relative py-[8px] flex justify-between items-center gap-[8px]`}
          >
            <h1 className="relative z-10">{item.title}</h1>
            {status === item.status && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 top-9 bg-primary rounded-[6px]"
              />
            )}
          </Link>
        ))}
      </div>
      <SearchComponent />
    </main>
  );
}
