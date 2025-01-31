import React from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "../ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatNumber } from "@/lib/functions";

export default function CardStatistic(props) {
  const { title, description, size, className, status } = props;
  const router = useRouter();
  return (
    <Card
      onClick={() => router.push(`/admin/orders/all?status=${status}`)}
      className={cn(className, "bg-white cursor-pointer")}
    >
      <CardContent className="gap-y-2 flex justify-between items-start">
        <div>
          <h1 className="font-bold textNormal4">{title}</h1>
          <p className="text-thin-secondary">{description}</p>
        </div>
        <h1 className="textBig3 font-midium">{formatNumber(size)}</h1>
      </CardContent>
      <CardFooter className="flex justify-end">
        <div className="flex justify-end items-center gap-2">
          <h1 className="font-medium textSmall2">Перейти</h1>
          <ChevronRight className="text-gray-500" />
        </div>
      </CardFooter>
    </Card>
  );
}
