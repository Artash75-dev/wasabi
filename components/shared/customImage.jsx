"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useState } from "react";

const CustomImage = ({ src, alt, className }) => {
  const [loading, setLoading] = useState(true);
  return (
    <Image
      src={src}
      alt={alt}
      layout="fill"
      quality={100}
      className={cn(
        className,
        `rounded-lg  duration-700 ease-in-out group-hover:opacity-75 ${
          loading
            ? "slice-110 blur-2xl grayscale"
            : "scale-100 blur-0 grayscale-0"
        }
        `
      )}
      onLoadingComplete={() => setLoading(false)}
    />
  );
};

export default CustomImage;
