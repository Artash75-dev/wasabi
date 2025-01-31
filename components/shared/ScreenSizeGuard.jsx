"use client";

import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import Cookies from "js-cookie";
import Link from "next/link";

export default function ScreenSizeGuard({ children }) {
  const [isScreenSmall, setIsScreenSmall] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    const handleResize = () => {
      setIsScreenSmall(window.innerWidth < 1000);
    };

    // Check screen size on initial load
    handleResize();

    // Listen for window resize
    window.addEventListener("resize", handleResize);

    // Clean up the event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (isScreenSmall && pathname.includes("/admin")) {
    return (
      <div className="fixed top-0 left-0 flex flex-col justify-center items-center w-screen h-screen bg-white z-[9999]">
        <TriangleAlert size={48} className="text-orange-500" />
        <h1 className="w-11/12 text-center font-bold text-foreground">
          Этот экран слишком мал, <br />
          пожалуйста, используйте экран побольше!!!
        </h1>
        <Link href="/login">
          <Button
            onClick={() => {
              Cookies.remove("auth");
              window.location.replace("/login");
            }}
            className={"bg-red-500 hover:bg-red-600"}
          >
            Log Out
          </Button>
        </Link>
      </div>
    );
  }

  return children;
}
