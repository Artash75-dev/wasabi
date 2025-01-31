"use client";

import { navLinks } from "@/lib/iterationDetails";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlignJustify } from "lucide-react";
import { usePathname } from "next/navigation";
export default function NavItems() {
  const pathname = usePathname();
  return (
    <main className="z-[1000]">
      <ul className="flex justify-start items-center gap-4 max-xl:hidden">
        {navLinks.map((item, idx) => (
          <Link href={item.link} key={idx} className="flex gap-3 items-center">
            <Image src={item.icon} alt={item.title} />
            <h1
              className={cn(
                item.link === pathname
                  ? "text-foreground"
                  : "text-gray-500 hover:text-foreground",
                "textSmall2 font-bold transition-all ease-linear duration-100"
              )}
            >
              {item.title}
            </h1>
          </Link>
        ))}
      </ul>
      <nav className="xl:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex justify-center items-center focus:outline-none">
            <AlignJustify size={32} className="" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-[1000]">
            {navLinks.map((item, idx) => (
              <Link key={idx} href={item.link}>
                <DropdownMenuItem className="flex justify-start items-center gap-2">
                  <Image className="w-5 h-5" src={item.icon} alt={item.title} />
                  <h1
                    className={cn(
                      item.link === pathname ? "font-bold" : "font-medium",
                      "textSmall2"
                    )}
                  >
                    {item.title}
                  </h1>
                </DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </main>
  );
}
