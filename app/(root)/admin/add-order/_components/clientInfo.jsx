import ClientMap from "@/components/pages/admin/clientMap";
import CustomFormField, {
  FormFieldType,
} from "@/components/shared/customFormField";
import Loader from "@/components/shared/loader";
import SubmitButton from "@/components/shared/submitButton";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { AddClientRevalidation } from "@/lib/validation";
import { orderCreateInfo, useEvent } from "@/store/event";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { CheckCheck, ChevronLeft, CircleX, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { PiListStarFill } from "react-icons/pi";
import { FaWallet } from "react-icons/fa6";
import { cn } from "@/lib/utils";

const ClientInfo = () => {
  const {
    setClients,
    clients,
    setReflesh,
    reflesh,
    clientInfoData,
    setClientInfoData,
  } = useEvent();
  const [loading, setLoading] = useState(true);
  const { setOrderData, orderData } = orderCreateInfo();
  const [isLoading, setIsLoading] = useState(false);
  const [updateData, setUpdateData] = useState();
  const [groupClients, setGroupClients] = useState([]);
  const searchParams = useSearchParams();
  const client = searchParams.get("client");
  const newClient = searchParams.get("newClient");
  const sex = [
    { client_sex: "1", label: "Мужчина" },
    { client_sex: "2", label: "Женщина" },
  ];
  const form = useForm({
    resolver: zodResolver(AddClientRevalidation),
    defaultValues: {
      client_name: "",
      client_sex: "1",
      birthday: "",
      phone: "",
      address: "",
      location: {
        latitude: "",
        longitude: "",
      },
    },
  });

  const handleSaveClient = () => {
    const { location, phone } = form.getValues();
    toast.success("Клиент выбран!");
    setOrderData({
      ...orderData,
      phone: phone,
      client: clientInfoData,
      comment: clientInfoData?.client?.comment,
      location,
    });
  };

  const onSubmit = async (values) => {
    setIsLoading(true);

    try {
      if (client) {
        const res = await axios.put(`/api/client?id=${client}`, values);
        setReflesh();
        if (res.data.error == 167) {
          form.setError(res.data.field, {
            message: "Номер телефона уже существует",
          });
          toast.error(`Номер телефона уже существует:${values.phone}`);
        } else {
          toast.success("Клиент успешно изменен!");
        }
      } else {
        const res = await axios.post("/api/client", values);
        if (res) {
          const clientData = await axios.get(
            `/api/client?id=${res?.data?.response}`
          );
          setClientInfoData(clientData?.data);
          setClients([clientData?.data?.client, ...clients]);
        }
        if (res.data.error == 167) {
          form.setError(res.data.field, {
            message: "Номер телефона уже существует",
          });
          toast.error(`Номер телефона уже существует:${values.phone}`);
        } else {
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
    const { latitude, longitude } = location;

    form.setValue("location", {
      latitude: Number(latitude),
      longitude: Number(longitude),
    });
    if (address) {
      form.setValue("address", address);
    }
  };

  const handleSaveAddress = (address) => {
    if (address?.lat != (0 || null) && address?.lng != (0 || null)) {
      form.setValue("location", {
        latitude: Number(address?.lat),
        longitude: Number(address?.lng),
      });
      setUpdateData({
        location: {
          latitude: Number(address?.lat),
          longitude: Number(address?.lng),
        },
      });
    } else {
      toast.error("Неверный адрес!!!");
      form.setValue("location", {
        latitude: null,
        longitude: null,
      });
    }
    form.setValue("address", address?.address1);
    setClientInfoData({
      ...clientInfoData,
      client: {
        ...clientInfoData?.client,
        address: address?.address1,
        client_address_id: address?.id,
      },
    });
  };

  useEffect(() => {
    setLoading(true);
    if (client) {
      (async () => {
        try {
          const res = await axios.get(`/api/client?id=${client}`);
          if (res?.data?.client) {
            const {
              client_sex,
              firstname,
              lastname,
              addresses,
              birthday,
              phone_number,
              comment,
              client_groups_id,
            } = res?.data?.client;
            form.setValue("comment", String(comment));
            form.setValue("client_groups_id", String(client_groups_id));
            form.setValue("client_name", lastname + " " + firstname);
            form.setValue("client_sex", String(client_sex));
            form.setValue("birthday", birthday);
            form.setValue("phone", `+${phone_number}`);
            if (
              orderData?.status == "bot" &&
              orderData?.location?.latitude &&
              orderData?.location?.longitude
            ) {
              setUpdateData({
                location: {
                  latitude: Number(orderData?.location?.latitude),
                  longitude: Number(orderData?.location?.longitude),
                },
              });
              form.setValue("location", {
                latitude: Number(orderData?.location?.latitude),
                longitude: Number(orderData?.location?.longitude),
              });

              const validAddresses = addresses?.filter(
                (address) =>
                  address.lat !== null &&
                  address.lng !== null &&
                  address.lat != 0 &&
                  address.lng != 0
              );

              const largestIdAddress = validAddresses?.reduce(
                (prev, current) => {
                  return current.id > prev.id ? current : prev;
                },
                validAddresses[0]
              );

              setClientInfoData({
                ...res?.data,
                client: {
                  ...res?.data?.client,
                  client_address_id: largestIdAddress?.id,
                  address: largestIdAddress.address1,
                },
              });
            } else {
              const validAddresses = addresses.filter(
                (address) =>
                  address.lat !== null &&
                  address.lng !== null &&
                  address.lat != 0 &&
                  address.lng != 0
              );

              const largestIdAddress = validAddresses?.reduce(
                (prev, current) => {
                  return current.id > prev.id ? current : prev;
                },
                validAddresses[0]
              );

              if (largestIdAddress) {
                form.setValue("location", {
                  latitude: Number(largestIdAddress.lat),
                  longitude: Number(largestIdAddress.lng),
                });
                form.setValue("address", largestIdAddress.address1);

                setClientInfoData({
                  ...res?.data,
                  client: {
                    ...res?.data?.client,
                    client_address_id: largestIdAddress?.id,
                    address: largestIdAddress.address1,
                  },
                });

                setUpdateData({
                  location: {
                    latitude: Number(largestIdAddress.lat),
                    longitude: Number(largestIdAddress.lng),
                  },
                });
              } else {
                setClientInfoData({
                  ...res?.data,
                  client: {
                    ...res?.data?.client,
                    client_address_id: addresses?.filter(
                      (address) => address.address1 != ""
                    )[0]?.id,
                    address: addresses?.filter(
                      (address) => address.address1 != ""
                    )[0]?.address1,
                  },
                });
                form.setValue(
                  "address",
                  addresses?.filter((address) => address.address1 != "")[0]
                    ?.address1
                );
              }
            }
          }
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [client, reflesh]);

  useEffect(() => {
    if (newClient) {
      form.reset();
      setClientInfoData(null);
    }
  }, [newClient]);

  useEffect(() => {
    if (orderData?.status == "bot") {
      setUpdateData({
        location: {
          latitude: Number(orderData?.location?.latitude),
          longitude: Number(orderData?.location?.longitude),
        },
      });
      form.setValue("location", {
        latitude: Number(orderData?.location?.latitude),
        longitude: Number(orderData?.location?.longitude),
      });
      form.setValue("address", orderData?.address);
    }
  }, [
    orderData?.client?.client?.client_id,
    orderData,
    orderData?.client,
    form,
  ]);

  useEffect(() => {
    (async () => {
      try {
        const groups = await axios.get(`/api/client?groupId=true`);
        if (groups.data) {
          setGroupClients(groups.data);
        }
      } catch (error) {}
    })();
  }, []);

  console.log(client);

  return (
    <section className="relative min-h-[calc(100vh-115px)] shadow-custom p-4">
      <div className="flex justify-between items-center gap-3 w-full">
        <h1 className="font-bold textNormal4">Карточка клиента</h1>
        <Link href="/admin/add-order?topCategory=true">
          <Button className="hover:bg-transparent bg-transparent border text-primary textSmall3 font-medium">
            <ChevronLeft />
            Вернуться назад
          </Button>
        </Link>
      </div>
      <section className="w-full space-y-3">
        <p className="font-medium textSmall1 text-primary">Личная информация</p>
        {loading ? (
          <div className="min-h-[300px] flex gap-2 mx-auto w-11/12 z-10 justify-center items-center mt-24 mb-40 ">
            <Loader />
            <h1 className="textNormal1 text-thin font-bold">Загрузка...</h1>
          </div>
        ) : (
          <Form {...form} className="space-y-2">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <div className="w-full grid grid-cols-2 gap-2">
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
                  <ClientMap
                    updateData={updateData}
                    addLocation={addLocation}
                  />
                  {!(
                    form.getValues().location.latitude &&
                    form.getValues().location.longitude
                  ) && (
                    <h1 className="textSmall2 font-bold text-red-400">
                      Вы не выбрали адрес клиента
                    </h1>
                  )}
                </div>
                {clientInfoData?.group?.loyalty_type == 1 && (
                  <div className="w-full col-span-2 flex justify-start items-center gap-2">
                    <div className="flex justify-center items-center gap-2 px-2 py-1 border border-input rounded-md">
                      <PiListStarFill className="text-yellow-500 text-3xl" />
                      <h1>Баланс бонусов</h1>
                      <p>{clientInfoData?.client?.bonus / 100} Сум</p>
                    </div>
                    <div className="flex justify-center items-center gap-2 px-2 py-1 border border-input rounded-md">
                      <FaWallet className="text-yellow-950 text-2xl" />
                      <h1>Баланс депозита</h1>
                      <p>{clientInfoData?.client?.ewallet / 100} Сум</p>
                    </div>
                  </div>
                )}
                <div
                  className={cn(
                    "col-span-2 w-full flex justify-end items-end gap-3"
                  )}
                >
                  <SubmitButton
                    isLoading={isLoading}
                    className="w-full border border-input"
                  >
                    <Pencil />
                    {client ? "Изменить клиента" : "Добавить нового клиента"}
                  </SubmitButton>
                  <Button
                    type="button"
                    onClick={handleSaveClient}
                    className="w-full bg-primary hover:bg-primary"
                  >
                    <CheckCheck />
                    <h1>Выберите клиента</h1>
                  </Button>
                </div>
                {clientInfoData?.client?.addresses.length > 0 && (
                  <div className="col-span-1 w-full flex justify-start items-start gap-1 flex-col">
                    {clientInfoData?.client?.addresses
                      ?.slice()
                      ?.reverse()
                      ?.map((item, idx) => {
                        return (
                          <div
                            type="button"
                            onClick={() => handleSaveAddress(item)}
                            key={idx}
                            className={`${clientInfoData?.client?.client_address_id == item?.id ? "bg-primary text-white" : "text-black hover:bg-green-50"} px-2 py-1 rounded-md  cursor-pointer w-full flex flex-col border border-input text-start`}
                          >
                            {item?.address1 ? (
                              <h1 className="textSmall2 text-start">
                                {item?.address1}
                              </h1>
                            ) : (
                              <h1 className="textSmall2 text-red-400 text-start">
                                Нет адреса
                              </h1>
                            )}
                            {((!item?.lat && !item?.lng) ||
                              (item?.lat == 0 && item?.lng == 0)) && (
                              <h1 className="textSmall1 text-red-400 text-start">
                                Нет расположение
                              </h1>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </form>
          </Form>
        )}
      </section>
    </section>
  );
};

export default ClientInfo;
