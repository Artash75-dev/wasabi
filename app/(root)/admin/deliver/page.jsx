"use client";

import Getelements from "@/components/pages/admin/getElements";
import Container from "@/components/shared/container";
import Loader from "@/components/shared/loader";
import SearchComponent from "@/components/shared/searchComponent";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Eye } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function Deliver() {
  // const { response: deliveries } = await ApiService.getData(
  //   "access.getEmployees"
  // );

  const [delivers, setDelivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/api/deliver");
        setDelivers(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterSupplier = delivers.filter((item) => item.role_id == 11);
  return (
    <Container
      className={"mt-32 flex flex-col gap-4 justify-start items-start mb-4"}
    >
      <section className="flex justify-between items-center gap-3 w-full">
        <h1 className="font-bold textNormal4">Доставщики</h1>
        <div className="flex justify-end items-center gap-2">
          <div className="flex justify-end items-center gap-3">
            <Link
              className="flex justify-center items-center gap-2 border-[1px] px-3 py-2 hover:bg-green-100 transition-all ease-linear duration-300 rounded-md border-input"
              href="/admin/deliver/watch"
            >
              <Eye />
              Посмотреть курьеров
            </Link>
          </div>
          <div className="flex justify-end items-center gap-3">
            <SearchComponent />
          </div>
        </div>
      </section>
      {loading ? (
        <div className="w-full h-[calc(100vh-240px)] flex justify-center items-center gap-2">
          <Loader />
          <p>Загрузка...</p>
        </div>
      ) : (
        <section className="w-full">
          <Getelements data={filterSupplier} param="deliver" />
        </section>
      )}
    </Container>
  );
}
