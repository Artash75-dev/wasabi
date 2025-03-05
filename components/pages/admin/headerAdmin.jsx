import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationModalAdmin from "./NotificationModalAdmin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import NavItems from "@/components/shared/navItems";
import Container from "@/components/shared/container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createOrder } from "@/public/images";
import { LogOut, RefreshCw } from "lucide-react";
import Image from "next/image";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const HeaderAdmin = ({ pathname, authData }) => {
  const [products, setProducts] = useState([]);
  const router = useRouter();

const clearCache = async () => {
  try {
    const response = await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tag: 'products' }), // Send tag in body
    });

    if (!response.ok) {
      throw new Error('Revalidation failed');
    }

    router.refresh();
    toast.success("Cache cleared successfully");
  } catch (error) {
    console.error("Error clearing cache:", error);
    toast.error("Failed to clear cache");
  }
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productResponse] = await Promise.all([
          axios.get(`/api/product`),
        ]);
        setProducts(productResponse.data?.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  return (
    <Container
      className={`${
        pathname.includes("/delivery") ? "hidden" : "grid"
      } h-20 grid-cols-5 mx-auto`}
    >
      <div className="col-span-1 w-full h-full flex justify-center items-center border-r-2">
        <Link href="/admin" className="font-bold textNormal2">
          WASSABI DELIVERY
        </Link>
      </div>
      <div className="col-span-4 w-full h-full flex items-center justify-end xl:justify-between pl-4 gap-3">
        <NavItems />
        <div className="flex justify-end items-center gap-3">
          <Button className="rounded-md bg-white shadow-sm hover:bg-white text-primary font-medium ">
            <Link
              href="/admin/add-order?topCategory=true"
              className="flex justify-center items-center gap-2"
            >
              <Image src={createOrder} alt={"create"} />
              Создать заказ
            </Link>
          </Button>

          <NotificationModalAdmin products={products} />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>
                  {authData?.login.slice(0, 1)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-[1000] mr-4">
              <DropdownMenuLabel>{authData?.login}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex justify-start items-center gap-2"
                onClick={() => {
                  window.location.replace("/login");
                  Cookies.remove("auth");
                }}
              >
                <LogOut size={16} />
                <h1>Выйти</h1>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex justify-start items-center gap-2"
                onClick={clearCache}
              >
                <RefreshCw size={16} />
                <h1>Очистить кэш</h1>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Container>
  );
};

export default HeaderAdmin;
