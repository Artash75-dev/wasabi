"use client";

import { searchIcon } from "@/public/images";
import Image from "next/image";
import { Input } from "../ui/input";
import { useEvent } from "@/store/event";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CircleX } from "lucide-react";

export default function SearchComponent({ placeholder, animate }) {
  const { searchValue, setSearchValue, searchFocus, setSearchFocus } =
    useEvent();
  const pathname = usePathname();

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
  };

  useEffect(() => {
    setSearchValue("");
    setSearchFocus(false);
  }, [pathname]);

  const handleFocus = () => setSearchFocus(true);

  return (
    <div
      className={`flex pr-2 justify-start items-center gap-1 border-2 border-input rounded-lg shadow-sm bg-white transition-all ${
        searchFocus && animate ? "w-full" : "w-auto"
      }`}
    >
      <div onClick={handleFocus} className="ml-2 cursor-pointer">
        <Image src={searchIcon} alt="search" className="w-8 h-8" />
      </div>
      <Input
        onChange={handleChange}
        onFocus={handleFocus}
        type="text"
        value={searchValue}
        placeholder={placeholder ? placeholder : "Поиск..."}
        className="font-medium text-thin border-0 p-0 bg-transparent"
      />
      {(searchValue || searchFocus) && animate && (
        <CircleX
          className="cursor-pointer"
          onClick={() => {
            setSearchValue(null);
            setSearchFocus(false);
          }}
        />
      )}
    </div>
  );
}
