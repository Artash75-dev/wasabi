"use client";

import ClientMap from "@/components/pages/admin/clientMap";
import Container from "@/components/shared/container";
import CustomFormField, {
  FormFieldType,
} from "@/components/shared/customFormField";
import Loader from "@/components/shared/loader";
import SubmitButton from "@/components/shared/submitButton";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { AddClientRevalidation } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ChevronLeft, CircleX } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function AddClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(false);
  const [updateData, setUpdateData] = useState();
  const [loading, setLoading] = useState(true);
  const [groupClients, setGroupClients] = useState([]);
  const form = useForm({
    resolver: zodResolver(AddClientRevalidation),
    defaultValues: {
      client_name: "",
      client_sex: "1",
      client_groups_id: "",
      birthday: "",
      phone: "",
      address: "",
      location: {
        latitude: "",
        longitude: "",
      },
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      if (id) {
        const res = await axios.put(`/api/client?id=${id}`, values);
        if (res.data.error) {
          console.log(res.data.error);
          form.setError(res.data.field, {
            message: "Номер телефона уже существует",
          });

          toast.error(`Номер телефона уже существует:${values.phone}`);
        } else {
          toast.success("Клиент успешно изменен!");
        }
      } else {
        const res = await axios.post("/api/client", values);
        if (res.data.error == 167) {
          form.setError(res.data.field, {
            message: "Номер телефона уже существует",
          });
          toast.error(`Номер телефона уже существует:${values.phone}`);
        } else {
          form.reset();
          toast.success("Клиент успешно добавлен!");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Что-то пошло не так. Пожалуйста, повторите попытку позже.");
    } finally {
      setIsLoading(false);
    }
  };
  const addLocation = (location, address) => {
    const { latitude, longitude } = location; // location obyektidan qiymatlarni olish

    form.setValue("location", {
      latitude: Number(latitude),
      longitude: Number(longitude),
    });

    if (address) {
      form.setValue("address", address);
    }
  };

  const sex = [
    { client_sex: "1", label: "Мужчина" },
    { client_sex: "2", label: "Женщина" },
  ];

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const res = await axios.get(`/api/client?id=${id}`);
          const groups = await axios.get(`/api/client?groupId=true`);
          if (groups.data) {
            setGroupClients(groups.data);
          }
          if (res?.data?.client) {
            const {
              address,
              client_sex,
              firstname,
              lastname,
              addresses,
              birthday,
              phone_number,
              comment,
              client_groups_id,
            } = res?.data?.client;
            form.setValue("client_name", lastname + " " + firstname);
            form.setValue("client_sex", String(client_sex));
            form.setValue("comment", String(comment));
            form.setValue("client_groups_id", String(client_groups_id));
            form.setValue("address", address);
            form.setValue("birthday", birthday);
            form.setValue("phone", `+${phone_number}`);
            const validAddresses = addresses.filter(
              (address) =>
                address.lat !== null &&
                address.lng !== null &&
                address.lat != 0 &&
                address.lng != 0
            );

            const largestIdAddress = validAddresses?.reduce((prev, current) => {
              return current.id > prev.id ? current : prev;
            }, validAddresses[0]);

            if (largestIdAddress) {
              form.setValue("location", {
                latitude: Number(largestIdAddress.lat),
                longitude: Number(largestIdAddress.lng),
              });

              setUpdateData({
                location: {
                  latitude: Number(largestIdAddress.lat),
                  longitude: Number(largestIdAddress.lng),
                },
              });
            }
          }
        } catch (error) {
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setLoading(false);
    }
  }, [id, form]);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const groups = await axios.get(`/api/client?groupId=true`);
        if (groups.data) {
          setGroupClients(groups.data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchClientData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-120px)] flex justify-center items-center gap-2">
        <Loader />
        <p>Загрузка...</p>
      </div>
    );
  }
  return (
    <Container
      className={"mt-24 flex flex-col gap-4 justify-start items-start mb-4"}
    >
      <div className="w-full flex justify-between items-center gap-2">
        <h1 className="textNormal3 font-bold">Добавления клиента</h1>
        <Link href="/admin/clients">
          <Button className="hover:bg-transparent bg-transparent border text-primary textSmall3 font-medium">
            <ChevronLeft />
            Вернуться назад
          </Button>
        </Link>
      </div>
      <section className="w-[70%] space-y-3">
        <p className="font-medium textSmall1 text-primary">Личная информация</p>
        <Form {...form} className="space-y-2">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <div className="w-full grid grid-cols-2 gap-3">
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="client_name"
                placeholder="ФИО клиента"
              />
              <CustomFormField
                fieldType={FormFieldType.DATE_PICKER}
                control={form.control}
                name="birthday"
                placeholder="Дата рождения"
              />
              <CustomFormField
                fieldType={FormFieldType.PHONE_INPUT}
                control={form.control}
                name="phone"
                className=""
                placeholder="Номер телефона"
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="address"
                placeholder="Место жительство"
              />
              <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={form.control}
                name="client_sex"
                placeholder="Выберите пол"
              >
                {sex?.map((s, i) => (
                  <SelectItem key={i} value={`${s.client_sex}`}>
                    <p>{s.label}</p>
                  </SelectItem>
                ))}
              </CustomFormField>
              <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={form.control}
                name="client_groups_id"
                placeholder="Выберите группу клиентов"
              >
                {groupClients?.map((s, i) => (
                  <SelectItem key={i} value={String(s?.client_groups_id)}>
                    <p>{s?.client_groups_name}</p>
                  </SelectItem>
                ))}
              </CustomFormField>
              <div className="col-span-2 w-full">
                <CustomFormField
                  fieldType={FormFieldType.TEXTAREA}
                  control={form.control}
                  name="comment"
                  placeholder="Комментарий к адресу"
                />
              </div>
              <div className="w-full col-span-2">
                <ClientMap updateData={updateData} addLocation={addLocation} />
                {!(
                  form.getValues().location.latitude &&
                  form.getValues().location.longitude
                ) && (
                  <h1 className="textSmall2 font-bold text-red-400">
                    Вы не выбрали адрес клиента
                  </h1>
                )}
              </div>
            </div>
            <div className="flex justify-end items-end gap-3">
              <SubmitButton
                isLoading={isLoading}
                className="w-full bg-primary hover:bg-primary"
              >
                {id ? "Изменять нового клиента" : "Добавить нового клиента"}
              </SubmitButton>
            </div>
          </form>
        </Form>
      </section>
    </Container>
  );
}
