"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "../ui/button";

export default function NotFoundPage() {
  const router = useRouter();
  return <Button className="hover:bg-primary" onClick={() => router.back()}>Nott found</Button>;
}
