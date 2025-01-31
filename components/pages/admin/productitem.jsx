"use client";
import CustomImage from "@/components/shared/customImage";
import { truncateText } from "@/lib/functions";
import { POSTER_URL } from "@/lib/utils";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function ProductItem(props) {
  const { title, href, image } = props;

  const imageUrl = image
    ? `${POSTER_URL}${image}`
    : "https://img.taste.com.au/lNnNoTvU/taste/2010/01/sushi-187034-1.jpg";
  return (
    <>
      {href == "none" ? (
        <main className="h-full bg-white p-4 rounded-md shadow-sm space-y-2 flex flex-col justify-between items-between">
          <div className="cursor-pointer flex justify-between items-between gap-2">
            <h1 className="font-bold textNormal1 text-start">
              {truncateText(title, 30)}
            </h1>
            <Plus className="text-gray-500" />
          </div>
          <div className="relative w-full min-h-20 h-full">
            <CustomImage
              className={" object-cover h-full w-full"}
              src={imageUrl}
              alt={"img"}
              fill
            />
          </div>
        </main>
      ) : (
        <Link
          className="bg-white p-4 rounded-md shadow-sm space-y-2 flex flex-col justify-between items-between"
          href={href}
        >
          <div className="cursor-pointer flex justify-between items-between gap-2">
            <h1 className="font-bold textNormal1 text-start">
              {truncateText(title, 30)}
            </h1>
            <div className="w-4">
              <ChevronRight className="text-gray-500" />
            </div>
          </div>
          <div className="relative w-full min-h-20 h-full">
            <CustomImage
              className={"object-cover h-full w-full"}
              src={imageUrl}
              alt={"img"}
              fill
            />
          </div>
        </Link>
      )}
    </>
  );
}
