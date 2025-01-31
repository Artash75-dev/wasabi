"use client";

import Getelements from "@/components/pages/admin/getElements";
import Container from "@/components/shared/container";
import Loader from "@/components/shared/loader";
import SearchComponent from "@/components/shared/searchComponent";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Plus } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const client = await axios.get("/api/client");
        setClients(client?.data);
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
        <h1 className="font-bold textNormal4">Клиенты</h1>
        <div className="flex justify-end items-center gap-3">
          <SearchComponent />
          <Button className="bg-white border-input border-2 py-1 px-4">
            <Link href="/admin/clients/add" className="flex space-x-2">
              <Plus size={20} className="text-primary" />
              <h1 className="text-primary font-medium">Добавить клиента</h1>
            </Link>
          </Button>
        </div>
      </section>
      {loading ? (
        <div className="w-full h-[calc(100vh-240px)] flex justify-center items-center gap-2">
          <Loader />
          <p>Загрузка...</p>
        </div>
      ) : (
        <section className="w-full">
          <Getelements data={clients} param="clients" />
        </section>
      )}
    </Container>
  );
}
