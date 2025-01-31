"use client";

import Getelements from "@/components/pages/admin/getElements";
import Container from "@/components/shared/container";
import SearchComponent from "@/components/shared/searchComponent";
import axios from "axios";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function Branches() {
  // const { response } = await ApiService.getData(`spots.getSpots`);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/api/deliver?spots=true");
        setBranches(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Container
      className={"mt-32 flex flex-col gap-4 justify-start items-start mb-4"}
    >
      <section className="flex justify-between items-center gap-3 w-full">
        <h1 className="font-bold textNormal4">Филиалы</h1>
        <div className="flex justify-end items-center gap-3">
          <SearchComponent />
          {/* <Button className="space-x-2 px-4 bg-white border-input border-2 py-1">
            <Plus size={20} className="text-primary" />
            <h1 className="text-primary font-medium">Добавить филиал</h1>
          </Button> */}
        </div>
      </section>
      {loading ? (
        <div className="w-full h-[calc(100vh-240px)] flex justify-center items-center gap-2">
          <Loader />
          <p>Загрузка...</p>
        </div>
      ) : (
        <section className="w-full">
          <Getelements data={branches} param="branches" />
        </section>
      )}
    </Container>
  );
}
