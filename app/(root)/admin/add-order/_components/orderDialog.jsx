"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { closeIcon, sendIcon } from "@/public/images";
import { Map, Placemark, YMaps, ZoomControl } from "@pbe/react-yandex-maps";
import useProductStore, { orderCreateInfo, useEvent } from "@/store/event";
import axios from "axios";
import { apiKeyYandex } from "@/lib/utils";
import toast from "react-hot-toast";
import Loader from "@/components/shared/loader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { roundToTwoDecimals } from "@/lib/functions";
import { getCreatingStatus } from "@/lib/orderSource";
import { buildOrderComment } from "@/lib/orderComment";

const socket = io();

export default function OrderDialog({
  categoryData,
  productsData,
  orderSources,
}) {
  const noDisccountCategories = categoryData?.filter(
    (c) => +c?.nodiscount == 1
  );
  const noDiscountProducts = productsData?.filter((p) => +p?.nodiscount == 1);

  const [isOpen, setIsOpen] = useState(false); // State to manage dialog open/close
  const [clientData, setClientData] = useState();
  const {
    resetProduct,
    products,
    initializeProducts,
    initializeDiscountProducts,
    discountProducts,
    removeDiscount,
  } = useProductStore();

  const router = useRouter();
  const { discountsNames, orderData, setOrderData, discounts } =
    orderCreateInfo();
  const { reload } = useEvent();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    const deliverP = localStorage.getItem("delivery_price");
    if (deliverP) {
      setOrderData((prev) => ({
        ...prev,
        delivery_price: deliverP,
      }));
    }
    if (orderData.phone && orderData?.client) {
      setIsOpen(true);
    } else {
      if (orderData?.client?.client) {
        router.push(
          `/admin/add-order?client=${orderData?.client?.client?.client_id}`
        );
      }
      toast.error(
        "Информация о клиенте неполная, пожалуйста, проверьте всю информацию!"
      );
    }
  };

  const handleSubmitOrder = async () => {
    const locations = orderData?.location;
    if (!orderData?.serviceOption) {
      toast.error("Выберите сервисный режим - «Навынос».");
      return;
    } else if (
      (locations?.latitude == null &&
        locations?.longitude == null &&
        orderData?.serviceOption?.service_mode == 3) ||
      (locations?.latitude == 0 &&
        locations?.longitude == 0 &&
        orderData?.serviceOption?.service_mode == 3)
    ) {
      toast.error("Вы ввели недействительный адрес для доставки!");
      return;
    } else if (orderData.spot_id == 0) {
      toast.error("Вы не выбрали точку доставки!");
      return;
    } else if (products.length == 0 && discountProducts?.length == 0) {
      toast.error("Вы не добавили ни одного продукта!");
      return;
    } else {
      try {
        setIsLoading(true);
        const {
          spot_id,
          chat_id,
          phone,
          payment_method,
          total,
          location,
          status,
          spot_name,
          delivery_price,
          discountPrice,
          comment,
          client_comment,
          pay_cash,
          pay_card,
          pay_payme,
          pay_click,
          stick_count,
          pers_num,
          delivery_time,
          _id,
          serviceOption,
          pay_bonus,
          pay_sertificate,
          promocode,
        } = orderData;

        let filterProducts = products?.map((p) => {
          let priceProd = p?.price?.["1"] ? Number(p.price["1"]) / 100 : 0;
          if (serviceOption?.id) {
            const findSourcesPrice = p?.sources?.find(
              (src) => src?.id == serviceOption?.id
            )?.price;
            if (findSourcesPrice) {
              priceProd = Number(findSourcesPrice) / 100;
            }
          }
          return {
            product_name: p.product_name,
            product_id: p.product_id,
            count: p.count,
            modifications: p.modifications ? p.modifications : [],
            category_name: p.category_name,
            menu_category_id: p.menu_category_id,
            photo: p.photo,
            price: priceProd,
          };
        });
        let filterProductsDiscount = discountProducts
          ?.filter((dsc) => dsc?.discount?.active)
          ?.map((p) => {
            let priceProd = p?.price?.["1"] ? Number(p.price["1"]) / 100 : 0;
            if (serviceOption?.id) {
              const findSourcesPrice = p?.sources?.find(
                (src) => src?.id == serviceOption?.id
              )?.price;
              if (findSourcesPrice) {
                priceProd = Number(findSourcesPrice) / 100;
              }
            }
            return {
              product_name: p.product_name,
              product_id: p.product_id,
              count: p.count,
              modifications: p.modifications ? p.modifications : [],
              category_name: p.category_name,
              menu_category_id: p.menu_category_id,
              photo: p.photo,
              price: priceProd, // Default to 0 if price["1"] is undefined
              promotion_id: p?.discount?.promotion_id,
            };
          });

        const updatedProducts = [...filterProducts, ...filterProductsDiscount];
        const orderComment = buildOrderComment({
          manualComment: comment,
          clientAddressComment: clientData?.comment,
          serviceName: serviceOption?.name,
          promocode,
          stickCount: stick_count,
          persNum: pers_num,
          payCash: pay_cash,
          payCard: pay_card,
          payPayme: pay_payme,
          payClick: pay_click,
          payBonus: pay_bonus,
          payCertificate: pay_sertificate,
        });
        const deliverPrice =
          serviceOption?.service_mode == 2
            ? 0
            : Number(delivery_price ? delivery_price : 0);
        let filterOrderData = {
          _id: _id ? _id : null,
          bonus: 0,
          phone,
          chat_id,
          products: updatedProducts,
          service_mode: Number(serviceOption?.service_mode),
          payment_method,
          total: +total + deliverPrice,
          location:
            Number(serviceOption?.service_mode) == 3
              ? location
              : {
                latitude: 0,
                longitude: 0,
              },
          status: getCreatingStatus(status),
          client_id: Number(clientData?.client_id),
          delivery_price: deliverPrice,
          client_name: clientData?.firstname + " " + clientData?.lastname,
          address: clientData?.address,
          spot_name,
          spot_id,
          discount_price: Number(discountPrice ? discountPrice : 0),
          comment: orderComment,
          client_comment,
          delivery_time,
          serviceOption,
          pay_bonus,
          pay_card,
          pay_click,
          pay_payme,
          pay_cash,
          pay_sertificate,
          client_address_id: Number(clientData?.client_address_id),
        };
        if (filterOrderData) {
          const res = await axios.post("/api/order", filterOrderData);
          if (res) {
            if (filterOrderData.chat_id !== 0) {
              socket.emit("order-status", {
                chat_id: filterOrderData?.chat_id,
                order_status: "created",
              });
            }
            setIsOpen(false);
            toast.success("Заказ успешно отправлен!");
            setOrderData({
              spot_id: 0,
              spot_name: "",
              phone: "",
              products: [],
              service_mode: 3,
              payment_method: "Наличными",
              total: 0,
              chat_id: 0,
              location: {},
              status: "created",
              client: null,
              discount: {},
              delivery_price: 0,
              discountPrice: 0,
              stick_count: null,
              pay_card: null,
              pay_cash: null,
              pay_bonus: null,
              pay_sertificate: null,
              pay_click: null,
              pay_payme: null,
              client_comment: "",
              comment: "",
              address: "",
              stick_count: null,
              pers_num: null,
              delivery_time: 60,
            });
            localStorage.setItem("products", []);
            localStorage.setItem("discountProducts", []);
            resetProduct();
            removeDiscount();
            setClientData();
          }
        }
      } catch (error) {
        console.log(error);
        toast.error("Что-то пошло не так. Повторите попытку!!!");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResetOrder = () => {
    setOpen(false);
    setClientData();
    setOrderData({
      spot_id: 0,
      spot_name: "",
      phone: "",
      products: [],
      service_mode: 3,
      payment_method: "Наличными",
      total: 0,
      delivery_price: 0,
      chat_id: 0,
      location: {},
      status: "created",
      client: null,
      discountPrice: 0,
      pay_cash: null,
      pay_card: null,
      client_comment: "",
      comment: "",
      address: "",
      stick_count: null,
      delivery_time: 60,
    });
    localStorage.setItem("products", []);
    localStorage.setItem("discountProducts", []);
    resetProduct();
    removeDiscount();
    setIsOpen(false);
  };

  useEffect(() => {
    initializeProducts();
    initializeDiscountProducts();

    (async () => {
      try {
        const { data } = await axios.get(`/api/branch`);
        setBranches(data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const calculateProductTotal = (product, active) => {
    let total = 0;

    // Helper function to calculate the discounted price
    const applyDiscount = (price, discount) => {
      if (!discount) return roundToTwoDecimals(price);

      if (discount?.params?.result_type == 2) {
        // Fixed discount
        return roundToTwoDecimals(
          Math.max(0, price - discount.params.discount_value / 100)
        );
      } else if (discount?.params?.result_type == 3) {
        // Percentage discount
        return roundToTwoDecimals(
          (price * (100 - discount.params.discount_value)) / 100
        );
      }

      return roundToTwoDecimals(price);
    };

    // Calculate product price
    let productPrice = Number(product?.price["1"]) / 100;
    if (active) {
      if (product?.discount?.active) {
        productPrice = applyDiscount(productPrice, product?.discount);
      } else {
        productPrice = applyDiscount(productPrice, null);
      }
    }
    total += productPrice * product?.count;

    return roundToTwoDecimals(total);
  };

  useEffect(() => {
    console.log(discountProducts);

    const calculateTotals = async () => {
      let noDiscountProductsTotal = 0; // Aktiv emas mahsulotlar
      let activeNoDiscountProductsTotal = 0; // Aktiv, lekin discount yo'q
      let activeWithDiscountProductsTotal = 0; // Aktiv va discount mavjud mahsulotlar
      let discountClientPrice = 0;

      // Mahsulotlarni tahlil qilish
      products.forEach((product) => {
        const isInNoDiscountProducts = noDiscountProducts?.some(
          (prd) => prd?.product_id == product?.product_id
        );
        const isInNoDiscountCategories = noDisccountCategories?.some(
          (prd) => prd?.category_id == product?.menu_category_id
        );

        // 1. Aktiv emas mahsulotlar (no-discount ro‘yxatida bo‘lganlar)
        if (isInNoDiscountProducts || isInNoDiscountCategories) {
          noDiscountProductsTotal += calculateProductTotal(product, false);
          return;
        }
        // 2. Aktiv, lekin discount yo'q
        activeNoDiscountProductsTotal += calculateProductTotal(product, false);
      });
      if (discountProducts?.length > 0) {
        discountProducts?.forEach((product) => {
          if (product?.discount?.active) {
            activeWithDiscountProductsTotal += calculateProductTotal(
              product,
              true
            );
          } else {
            activeWithDiscountProductsTotal += 0;
          }
        });
      } else {
        activeWithDiscountProductsTotal = 0;
      }
      // Client aksiyasini qo‘llash faqat "aktiv va discount yo'q" mahsulotlarga
      if (orderData?.client?.client) {
        try {
          const clientDataFetch = orderData?.client?.client;
          const clientGroupData = orderData?.client?.group;

          if (clientDataFetch) {
            setClientData(clientDataFetch);
            const { client_groups_discount, discount_per } = clientDataFetch;

            if (clientGroupData?.loyalty_type == 2) {
              if (+client_groups_discount < +discount_per) {
                discountClientPrice = roundToTwoDecimals(
                  activeNoDiscountProductsTotal * (+discount_per / 100)
                );
                activeNoDiscountProductsTotal = roundToTwoDecimals(
                  activeNoDiscountProductsTotal * (1 - +discount_per / 100)
                );
              } else {
                discountClientPrice =
                  activeNoDiscountProductsTotal *
                  roundToTwoDecimals(+client_groups_discount / 100);
                activeNoDiscountProductsTotal = roundToTwoDecimals(
                  activeNoDiscountProductsTotal *
                  (1 - +client_groups_discount / 100)
                );
              }
            }
          }
        } catch (error) {
          console.error("Error fetching client data:", error);
        }
      }

      console.log(
        { noDiscountProductsTotal },
        { activeNoDiscountProductsTotal },
        { activeWithDiscountProductsTotal }
      );

      setOrderData((prev) => ({
        ...prev,
        total:
          roundToTwoDecimals(noDiscountProductsTotal) +
          roundToTwoDecimals(activeNoDiscountProductsTotal) +
          roundToTwoDecimals(activeWithDiscountProductsTotal),
        discountPrice: roundToTwoDecimals(discountClientPrice),
      }));
    };
    calculateTotals();
  }, [
    products,
    orderData?.client,
    discountProducts,
    discountProducts?.discount?.active,
    reload,
    discounts,
  ]);
  console.log(orderData);

  return (
    <Dialog open={isOpen}>
      <DialogTrigger asChild>
        <section className="absolute flex flex-col justify-center items-center left-0 bottom-0 w-full bg-background py-2 shadow-custom gap-2">
          <div className="w-full px-4 flex justify-between items-center">
            <h1 className="font-bold textNormal1">К оплате</h1>
            <p className="font-bold textNormal2">{orderData?.total} сум</p>
          </div>

          <Button
            className="w-1/2 mx-auto bg-primary hover:bg-primary"
            onClick={handleOpen}
          >
            Оплатить
          </Button>
        </section>
      </DialogTrigger>
      <DialogContent className="min-w-full h-screen w-11/12 max-h-screen bg-transparent p-0 border-0 rounded-none overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center gap-2">
            <Loader />
            <p className="text-center textNormal2 text-thin">Загрузка...</p>
          </div>
        ) : (
          <main className="my-auto flex h-screen w-11/12 min-w-11/12 max-w-[1440px] flex-col overflow-hidden rounded-md bg-background shadow-custom mx-auto">
            <DialogHeader className="border-b px-4 py-4">
              <DialogTitle asChild>
                <h1 className="textNormal1 text-thin text-center">
                  Новый заказ
                </h1>
              </DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <section className="flex-1 overflow-y-auto p-4 pb-28">
              <main className="w-full min-w-full grid grid-cols-8 gap-3 items-start">
                <OrderCheck
                  products={products}
                  setClientData={setClientData}
                  clientData={clientData}
                  discountProducts={discountProducts}
                  discountsNames={discountsNames}
                />
                <OrderMap
                  branches={branches}
                  orderData={orderData}
                  clientData={clientData}
                  setOrderData={setOrderData}
                />
                <TotalInfo
                  totalSum={orderData?.total}
                  deliveryPrice={orderData?.delivery_price}
                  orderData={orderData}
                  setOrderData={setOrderData}
                  orderSources={orderSources}
                />
              </main>
            </section>
            <section className="sticky bottom-0 z-10 flex w-full items-center justify-center gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/90">
              <Button
                disabled={isLoading}
                onClick={handleSubmitOrder}
                className={`${isLoading && "opacity-70"} bg-white border-[1px] shadow-sm flex justify-start items-center gap-2 w-40`}
              >
                {isLoading ? <Loader /> : <Image src={sendIcon} alt="send" />}
                <h1 className="textSmall2 text-primary font-bold">Отправить</h1>
              </Button>
              <Button
                className="bg-white border-[1px] shadow-sm flex justify-start items-center gap-2 w-40"
                onClick={() => setIsOpen(false)} // Close dialog on cancel
              >
                <Image src={closeIcon} alt="close" />
                <h1 className="textSmall2 text-red-600 font-bold">Отмена</h1>
              </Button>
              <AlertDialog
                open={open}
                onOpenChange={setOpen}
                className="z-[9999] max-w-11/12 mx-auto"
              >
                <AlertDialogTrigger asChild>
                  <Button
                    className="bg-red-500 hover:bg-red-400 border-[1px] shadow-sm flex justify-start items-center gap-2"
                    onClick={() => setOpen(true)} // Close dialog on cancel
                  >
                    <Trash2 />
                    <h1 className="textSmall2 text-white font-bold">
                      Закрыть без оплаты
                    </h1>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="z-[1000] rounded-md w-11/12 mx-auto">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Вы уверены, что хотите выполнить заказ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Если вы действительно хотите выполнить заказ, нажмите
                      кнопку «Продолжить».
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setOpen(false)}>
                      Отмена
                    </AlertDialogCancel>

                    <Button
                      disabled={isLoading}
                      className="hover:bg-primary"
                      onClick={handleResetOrder}
                    >
                      Продолжить
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </section>
          </main>
        )}
      </DialogContent>
    </Dialog>
  );
}

const OrderMap = ({ orderData, setOrderData, branches, clientData }) => {
  const orders = useQuery(api.order.get) || [];
  const defaultCoordinates = [41.311158, 69.279737];
  const [coordinates, setCoordinates] = useState(defaultCoordinates); // Marker coordinates
  const [mapCenter, setMapCenter] = useState(defaultCoordinates); // Map center coordinates
  const [mapZoom, setMapZoom] = useState(10);

  const handleAddBranch = (branch) => {
    setOrderData((prev) => ({
      ...prev,
      spot_id: branch?.spot_id,
      spot_name: branch?.name,
    }));
  };

  useEffect(() => {
    const { latitude, longitude } = orderData.location;
    if (longitude && latitude) {
      setCoordinates([latitude, longitude]);
      setMapCenter([latitude, longitude]);
    } else {
      setMapCenter([41.311158, 69.279737]);
      setCoordinates(null);
    }
  }, []);

  return (
    <main className="col-span-3 space-y-2">
      <section className="shadow-custom p-4">
        <h1 className="text-center font-bold text-thin">Локация</h1>
        <div className="relative border-border border-2 rounded-md h-[350px] w-full">
          <YMaps query={{ apikey: apiKeyYandex }}>
            <Map
              width="100%"
              height="100%"
              state={{ center: mapCenter, zoom: mapZoom }}
            >
              {coordinates && (
                <Placemark
                  geometry={coordinates}
                  options={{
                    iconLayout: "default#image",
                    iconImageHref:
                      "https://wasabi-admin.onrender.com/_next/image?url=%2Ficons%2Fuser.png&w=96&q=75",
                    iconImageSize: [40, 40],
                    iconImageOffset: [-20, -40],
                  }}
                  properties={{
                    balloonContentHeader: `${clientData?.firstname + " " + clientData?.lastname}`,
                    balloonContentBody: `<div>${`${clientData?.phone}`}</div>`,
                    hintContent: `Клиент с адресом`,
                  }}
                  modules={["geoObject.addon.balloon", "geoObject.addon.hint"]}
                />
              )}
              {branches.length > 0 && (
                <>
                  {branches.map((branch, idx) => (
                    <Placemark
                      key={idx}
                      onClick={() => {
                        setOrderData((prev) => ({
                          ...prev,
                          spot_id: branch?.spot_id,
                        }));
                      }}
                      geometry={[+branch?.lat, +branch?.lng]}
                      options={{
                        iconLayout: "default#image",
                        iconImageHref:
                          branch?.spot_id == orderData?.spot_id
                            ? "https://wasabi-admin.onrender.com/_next/image?url=%2Ficons%2Fbranch1.png&w=96&q=75"
                            : "https://wasabi-admin.onrender.com/_next/image?url=%2Ficons%2Fbranch.png&w=96&q=75", // Ensure this path is correct
                        iconImageSize:
                          branch?.spot_id == orderData?.spot_id
                            ? [40, 40]
                            : [35, 35], // Make sure these sizes are appropriate for your image
                        iconImageOffset:
                          branch?.spot_id == orderData?.spot_id
                            ? [-20, -20]
                            : [-17.5, -17.5], // Adjust if necessary
                      }}
                      properties={{
                        balloonContentHeader: branch.name,
                        balloonContentBody: `<div>${branch.address}</div>`,
                        hintContent: branch.name,
                      }}
                      modules={[
                        "geoObject.addon.balloon",
                        "geoObject.addon.hint",
                      ]}
                    />
                  ))}
                </>
              )}
              <ZoomControl options={{ float: "right" }} />
            </Map>
          </YMaps>
        </div>
      </section>
      <section className="shadow-custom p-4 space-y-2">
        <h1 className="text-center font-bold text-thin">Выбрать филиал</h1>
        <div className="px-2 flex flex-col gap-2 max-h-[110px] overflow-y-scroll">
          {branches?.map((item, i) => (
            <div
              onClick={() => handleAddBranch(item)}
              key={i}
              className={`${+item?.spot_id == +orderData?.spot_id ? "bg-primary" : "bg-thin-secondary"} py-1 px-2 rounded-md cursor-pointer text-white border-border w-full flex justify-between items-center gap-3 `}
            >
              <h1 className="textSmall2 border-r-2 w-3/4">{item?.name}</h1>
              <p className="w-1/4 text-center textSmall1">
                <span className="textSmall3">
                  {
                    orders?.filter(
                      (c) =>
                        +c.spot_id == +item?.spot_id && c.status == "cooking"
                    )?.length
                  }{" "}
                </span>{" "}
                <br />
                Кол.ож. заказ
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

const OrderCheck = ({
  setClientData,
  clientData,
  products,
  discountProducts,
}) => {
  const { setOrderData, orderData } = orderCreateInfo();

  const handleAddDeliverPrice = (e) => {
    const value = e.target.value;
    localStorage.setItem("delivery_price", value);

    if (/^\d*$/.test(value)) {
      setOrderData((prev) => ({
        ...prev,
        delivery_price: +value,
      }));
    }
  };

  const handleAddAddress = (e) => {
    const { value } = e.target;
    setClientData({
      ...clientData,
      address: value,
    });
  };
  const handleAddComment = (e) => {
    const { value } = e.target;
    setOrderData((prev) => ({
      ...prev,
      comment: value,
    }));
  };
  const deliverPrice = localStorage.getItem("delivery_price");
  return (
    <main className="col-span-3 shadow-custom p-4 rounded-md flex justify-between items-start flex-col min-h-[720px]">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-thin px-2 textSmall1 py-1 text-left">
              Наименование
            </th>
            <th className="text-thin px-2 textSmall1 py-1 text-center">
              Кол-во
            </th>
            <th className="text-thin px-2 textSmall1 py-1 text-right">Цена</th>
            <th className="text-thin px-2 textSmall1 py-1 text-right">Итого</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="4" className="p-0">
              <div
                className="max-h-[200px] overflow-y-auto"
                style={{ display: "block" }}
              >
                <table className="w-full">
                  <tbody>
                    {products?.map((item, index) => {
                      const renderRow = (name, count, price) => (
                        <tr key={`${index}-${name}`} className="border-b">
                          <td className="text-foreground px-2 py-1 textSmall1 text-left">
                            {name}
                          </td>
                          <td className="text-thin px-2 py-1 textSmall1 text-center">
                            {count}
                          </td>
                          <td className="text-thin px-2 py-1 textSmall1 text-right">
                            {price} сум
                          </td>
                          <td className="text-thin px-2 py-1 textSmall1 text-right">
                            {price * count} сум
                          </td>
                        </tr>
                      );

                      if (item?.modifications?.length > 0) {
                        return (
                          <React.Fragment key={index}>
                            {item.modifications.map((m, i) =>
                              renderRow(
                                `${item.product_name} ${m.modificator_name}`,
                                m.count,
                                Number(m?.spots[0]?.price) / 100
                              )
                            )}
                          </React.Fragment>
                        );
                      } else {
                        return renderRow(
                          item.product_name,
                          item.count,
                          Number(item?.price["1"]) / 100
                        );
                      }
                    })}
                    {discountProducts?.map((item, index) => {
                      if (!item.discount.active) {
                        return null;
                      }
                      const renderRow = (name, count, price) => {
                        let prs;
                        if (item?.discount?.params?.result_type == 2) {
                          prs = Math.max(
                            0,
                            price - item?.discount.params.discount_value / 100
                          );
                        } else if (item?.discount?.params?.result_type == 3) {
                          prs =
                            (price *
                              (100 - +item?.discount.params.discount_value)) /
                            100;
                        } else if (item?.discount?.params?.result_type == 1) {
                          prs = price;
                        }

                        return (
                          <tr key={`${index}-${name}`} className="border-b">
                            <td className="text-foreground px-2 py-1 textSmall1   text-left">
                              {name}
                            </td>
                            <td className="text-thin px-2 py-1 textSmall1   text-center">
                              {count}
                            </td>
                            <td className="text-thin px-2 py-1 textSmall1   text-right">
                              <h1 className=""> {prs} </h1>
                              <p className="textSmall11 line-through">
                                {price}{" "}
                              </p>
                              сум
                            </td>
                            <td className="text-thin px-2 py-1 textSmall1   text-right">
                              <h1>{prs * count}</h1>
                              сум
                            </td>
                          </tr>
                        );
                      };

                      if (item?.modifications?.length > 0) {
                        return (
                          <React.Fragment key={index}>
                            {item.modifications.map((m, i) =>
                              renderRow(
                                `${item.product_name} ${m.modificator_name}`,
                                m.count,
                                Number(m?.spots[0]?.price) / 100
                              )
                            )}
                          </React.Fragment>
                        );
                      } else {
                        return renderRow(
                          item.product_name,
                          item.count,
                          Number(item?.price["1"]) / 100
                        );
                      }
                    })}
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <ul className="w-full textSmall2 h-[60%] space-y-3 mt-2 text-thin">
        <li className="border-border pt-2 border-t-2 flex flex-col items-start gap-3">
          <h1 className="col-span-1 font-medium">Комментарий:</h1>
          <div className="w-full flex flex-col gap-2 justify-start items-center">
            <Textarea
              onChange={handleAddComment}
              value={orderData?.comment || ""}
              placeholder="Введите комментарий для заказа"
              className="min-h-[120px] resize-y text-sm leading-6"
            />
          </div>
        </li>
        <li className="border-border pt-2 flex justify-between items-center gap-3">
          <h1 className="col-span-1">Клиент:</h1>
          <div className="col-span-2 flex flex-col gap-2 justify-start items-center">
            <p>{clientData?.firstname + " " + clientData?.lastname}</p>
          </div>
        </li>
        <li className="flex justify-between items-center gap-3">
          <h1 className="col-span-1">Номер телефона:</h1>
          <div className="col-span-2 flex flex-col gap-2 justify-start items-center">
            <p>{orderData?.phone}</p>
          </div>
        </li>
        <li className="border-border pb-2 border-b-2 flex justify-between items-center gap-3">
          <h1 className="">Адрес:</h1>
          <div className="w-full flex flex-col gap-2 justify-start items-center">
            <Input
              onChange={handleAddAddress}
              type="text"
              value={clientData?.address}
              placeholder=""
              className="col-span-1 text-end p-0"
            />{" "}
          </div>
        </li>
        <li className="flex justify-between items-center gap-3">
          <h1 className="col-span-1">Итого :</h1>
          <span className="col-span-2">
            {+orderData?.total + +orderData?.discountPrice} сум
          </span>
        </li>
        <li className="flex justify-between items-center gap-3">
          <h1 className="col-span-1">Промокод:</h1>
          <span className="col-span-2">
            {orderData?.promocode ? orderData?.promocode : "нет промокода"}
          </span>
        </li>
        <li className="flex justify-between items-center gap-3">
          <h1 className="col-span-1">Акция:</h1>
          <div className="col-span-2 flex flex-col gap-2 justify-start items-center">
            <p>{orderData?.discountPrice ? orderData?.discountPrice : 0} сум</p>
          </div>
        </li>
        <li className="flex justify-between items-center gap-3">
          <h1 className="w-full col-span-2">Сумма доставки:</h1>
          <Input
            disabled={orderData?.service_mode == 2}
            onChange={handleAddDeliverPrice}
            type="text"
            value={deliverPrice}
            className="col-span-1 text-end p-0"
          />
          сум
        </li>
        <li className="font-bold flex justify-between items-center gap-3">
          <h1 className="col-span-1">Сумма заказа:</h1>
          <span className="col-span-2">
            {orderData?.service_mode == 2
              ? orderData?.total
              : +orderData?.total + +orderData?.delivery_price}{" "}
            сум
          </span>
        </li>
      </ul>
    </main>
  );
};

const TotalInfo = ({ orderData, setOrderData, orderSources }) => {
  const sanitizeNumericInput = (value) => String(value ?? "").replace(/[^\d]/g, "");
  const toNonNegativeNumber = (value) => Math.max(0, Number(value) || 0);
  const getSanitizedAmount = (value, max) => {
    const digitsOnly = sanitizeNumericInput(value);

    if (!digitsOnly) {
      return 0;
    }

    return Math.min(Math.max(0, Number(digitsOnly)), Math.max(0, max));
  };

  const bonusPrice = +orderData?.client?.client?.bonus / 100 || 0;
  const {
    pay_bonus,
    pay_card,
    pay_cash,
    pay_click,
    pay_payme,
    pay_sertificate,
    total,
    delivery_price,
    service_mode,
  } = orderData;
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState([
    { type: "Наличными", title: "Наличными", value: null },
    { type: "Карта", title: "Карта", value: null },
  ]);

  const [selectedOption, setSelectedOption] = useState("");
  const totalSum =
    toNonNegativeNumber(orderData?.total) +
    (orderData?.service_mode == 2 ? 0 : toNonNegativeNumber(orderData?.delivery_price));
  const remainingAmount = Math.max(
    0,
    totalSum -
      toNonNegativeNumber(pay_bonus) -
      toNonNegativeNumber(pay_sertificate) -
      toNonNegativeNumber(pay_payme) -
      toNonNegativeNumber(pay_click)
  );
  const allocatedAmount = Math.max(0, totalSum - remainingAmount);

  const handleBonusChange = (value) => {
    const sanitizedBonus = getSanitizedAmount(
      value,
      Math.min(bonusPrice, totalSum)
    );

    if (sanitizedBonus == totalSum) {
      setOrderData((prev) => ({
        ...prev,
        pay_bonus: sanitizedBonus,
        pay_sertificate: 0,
        pay_click: 0,
        pay_payme: 0,
      }));
    } else {
      setOrderData((prev) => ({
        ...prev,
        pay_bonus: sanitizedBonus,
      }));
    }
  };

  const handleCertificateChange = (value) => {
    const sanitizedCertificate = getSanitizedAmount(value, totalSum);

    if (sanitizedCertificate == totalSum) {
      setOrderData((prev) => ({
        ...prev,
        pay_sertificate: sanitizedCertificate,
        pay_bonus: 0,
        pay_click: 0,
        pay_payme: 0,
      }));
    } else {
      setOrderData((prev) => ({
        ...prev,
        pay_sertificate: sanitizedCertificate,
      }));
    }
  };

  const handlePaymeChange = (value) => {
    const sanitizedCertificate = getSanitizedAmount(value, totalSum);

    if (sanitizedCertificate == totalSum) {
      setOrderData((prev) => ({
        ...prev,
        pay_payme: sanitizedCertificate,
        pay_bonus: 0,
        pay_sertificate: 0,
        pay_click: 0,
      }));
    } else {
      setOrderData((prev) => ({
        ...prev,
        pay_payme: sanitizedCertificate,
      }));
    }
  };

  const handleClickChange = (value) => {
    const sanitizedCertificate = getSanitizedAmount(value, totalSum);

    if (sanitizedCertificate == totalSum) {
      setOrderData((prev) => ({
        ...prev,
        pay_payme: 0,
        pay_bonus: 0,
        pay_sertificate: 0,
        pay_click: sanitizedCertificate,
      }));
    } else {
      setOrderData((prev) => ({
        ...prev,
        pay_click: sanitizedCertificate,
      }));
    }
  };

  // Handle cash and card payments
  const handlePaymentChange = (type, value) => {
    const sanitizedValue = getSanitizedAmount(value, remainingAmount);

    const updatedPayments = paymentData.map((pay) =>
      pay.type === type
        ? { ...pay, value: sanitizedValue }
        : {
          ...pay,
          value: remainingAmount - sanitizedValue,
        }
    );

    setPaymentData(updatedPayments);
  };

  const handleOptionSelect = (option) => {
    setOrderData((prev) => ({
      ...prev,
      serviceOption: option,
      service_mode: option?.service_mode,
    }));
    setSelectedOption(option);
  };

  useEffect(() => {
    const cashPay = paymentData?.find((py) => py.type === "Наличными")?.value;
    const cardPay = paymentData?.find((py) => py.type === "Карта")?.value;

    setOrderData((prev) => ({
      ...prev,
      pay_cash: toNonNegativeNumber(cashPay) || null,
      pay_card: toNonNegativeNumber(cardPay) || null,
    }));
  }, [paymentData]);

  useEffect(() => {
    setPaymentData([
      {
        type: "Наличными",
        title: "Наличными",
        value: Math.max(0, remainingAmount),
      },
      {
        type: "Карта",
        title: "Карта",
        value: 0,
      },
    ]);
  }, [
    pay_bonus,
    pay_click,
    pay_payme,
    pay_sertificate,
    total,
    delivery_price,
    selectedOption,
  ]);

  useEffect(() => {
    const totalSum = total + (service_mode == 2 ? 0 : +delivery_price);
    if (
      pay_card == totalSum ||
      pay_click == totalSum ||
      pay_payme == totalSum
    ) {
      setOrderData((prev) => ({
        ...prev,
        payment_method: "Карта",
      }));
    } else if (pay_cash == totalSum) {
      setOrderData((prev) => ({
        ...prev,
        payment_method: "Наличными",
      }));
    } else {
      setOrderData((prev) => ({
        ...prev,
        payment_method: "Наличными",
      }));
    }
  }, [
    total,
    pay_card,
    pay_bonus,
    pay_cash,
    pay_sertificate,
    pay_click,
    pay_payme,
    delivery_price,
    service_mode,
  ]);

  const additionalOptions = orderSources?.filter((option) => option.type === 1);

  return (
    <main className="col-span-2 self-start rounded-md shadow-custom bg-background">
      <section className="space-y-2 px-3 py-3">
        <div className="rounded-md border border-border p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h1 className="textSmall2 text-thin-secondary">К оплате</h1>
            <p className="text-sm font-medium">{totalSum} сум</p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <h1 className="textSmall2 text-thin-secondary">Распределено</h1>
            <p className="text-sm font-medium">{allocatedAmount} сум</p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <h1 className="textSmall2 text-thin-secondary">Остаток</h1>
            <p className="text-sm font-semibold">{remainingAmount} сум</p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="rounded-md border border-input px-3 py-2">
              <p className="textSmall1 text-thin-secondary">Наличными</p>
              <p className="text-sm font-medium">{toNonNegativeNumber(pay_cash)} сум</p>
            </div>
            <div className="rounded-md border border-input px-3 py-2">
              <p className="textSmall1 text-thin-secondary">Карта</p>
              <p className="text-sm font-medium">{toNonNegativeNumber(pay_card)} сум</p>
            </div>
            <div className="rounded-md border border-input px-3 py-2">
              <p className="textSmall1 text-thin-secondary">Payme</p>
              <p className="text-sm font-medium">{toNonNegativeNumber(pay_payme)} сум</p>
            </div>
            <div className="rounded-md border border-input px-3 py-2">
              <p className="textSmall1 text-thin-secondary">Click</p>
              <p className="text-sm font-medium">{toNonNegativeNumber(pay_click)} сум</p>
            </div>
            <div className="rounded-md border border-input px-3 py-2">
              <p className="textSmall1 text-thin-secondary">Бонус</p>
              <p className="text-sm font-medium">{toNonNegativeNumber(pay_bonus)} сум</p>
            </div>
            <div className="rounded-md border border-input px-3 py-2">
              <p className="textSmall1 text-thin-secondary">Сертификат</p>
              <p className="text-sm font-medium">{toNonNegativeNumber(pay_sertificate)} сум</p>
            </div>
          </div>
          <Button
            type="button"
            className="w-full bg-primary hover:bg-primary"
            onClick={() => setIsPaymentDialogOpen(true)}
          >
            Настроить оплату
          </Button>
        </div>
      </section>

      <section className="w-full space-y-2 px-3 pb-3">
        <div className="space-y-1 rounded-md border border-border p-2">
          <h1 className="textSmall2 text-thin-secondary">Режим обслуживания</h1>
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full rounded-md border border-input px-3 py-2 text-left text-sm">
              {orderData?.serviceOption?.name
                ? `Вы выбрали: ${orderData?.serviceOption?.name}`
                : "Выберите опцию"}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() =>
                  handleOptionSelect({
                    name: "Навынос",
                    service_mode: 2,
                  })
                }
              >
                Навынос
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handleOptionSelect({
                    name: "Доставка",
                    service_mode: 3,
                  })
                }
              >
                Доставка
              </DropdownMenuItem>
              {additionalOptions.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() =>
                    handleOptionSelect({
                      ...option,
                      service_mode: 3,
                    })
                  }
                >
                  {option.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="space-y-1 rounded-md border border-border p-2">
          <h1 className="textSmall2 text-thin-secondary">Количество палочки</h1>
          <Input
            placeholder="0"
            inputMode="numeric"
            onChange={(e) =>
              setOrderData((prev) => ({
                ...prev,
                stick_count: sanitizeNumericInput(e.target.value),
              }))
            }
            className="h-9 rounded-md border border-input px-3 text-base"
            value={orderData?.stick_count || ""}
          />
        </div>
        <div className="space-y-1 rounded-md border border-border p-2">
          <h1 className="textSmall2 text-thin-secondary">Количество клиенты</h1>
          <Input
            placeholder="0"
            inputMode="numeric"
            onChange={(e) =>
              setOrderData((prev) => ({
                ...prev,
                pers_num: sanitizeNumericInput(e.target.value),
              }))
            }
            className="h-9 rounded-md border border-input px-3 text-base"
            value={orderData?.pers_num || ""}
          />
        </div>
        <div className="space-y-1 rounded-md border border-border p-2">
          <h1 className="textSmall2 text-thin-secondary">Способ оплаты</h1>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{orderData?.payment_method}</p>
            <p className="textSmall1 text-thin-secondary">
              Остаток: {Math.max(0, remainingAmount)} сум
            </p>
          </div>
        </div>
      </section>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="w-[92vw] max-w-md rounded-md p-0">
          <div className="border-b px-4 py-3">
            <h1 className="text-base font-semibold">Настройка оплаты</h1>
            <p className="textSmall1 text-thin-secondary">
              Укажите суммы оплаты. Допускаются только значения от 0 и выше.
            </p>
          </div>
          <section className="max-h-[70vh] space-y-2 overflow-y-auto px-4 py-4">
            {paymentData.map((pay, i) => (
              <div key={i} className="rounded-md border border-border bg-background p-2">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h1 className="textSmall2 font-medium">{pay.title}</h1>
                  <span className="textSmall1 text-thin-secondary">сум</span>
                </div>
                <Input
                  type="text"
                  placeholder="0"
                  inputMode="numeric"
                  value={toNonNegativeNumber(pay.value)}
                  onChange={(e) => handlePaymentChange(pay.type, e.target.value)}
                  className="h-9 w-full rounded-md border border-input px-3 text-base"
                />
              </div>
            ))}
            <div className="rounded-md border border-border bg-background p-2">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h1 className="textSmall2 font-medium">Payme</h1>
                <span className="textSmall1 text-thin-secondary">сум</span>
              </div>
              <Input
                type="text"
                placeholder="0"
                inputMode="numeric"
                value={toNonNegativeNumber(orderData?.pay_payme)}
                onChange={(e) => handlePaymeChange(e.target.value)}
                className="h-9 w-full rounded-md border border-input px-3 text-base"
              />
            </div>
            <div className="rounded-md border border-border bg-background p-2">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h1 className="textSmall2 font-medium">Click</h1>
                <span className="textSmall1 text-thin-secondary">сум</span>
              </div>
              <Input
                type="text"
                placeholder="0"
                inputMode="numeric"
                value={toNonNegativeNumber(orderData?.pay_click)}
                onChange={(e) => handleClickChange(e.target.value)}
                className="h-9 w-full rounded-md border border-input px-3 text-base"
              />
            </div>

            {orderData?.client?.group?.loyalty_type == 1 && bonusPrice != 0 && (
              <div className="rounded-md border border-border bg-background p-2">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h1 className="textSmall2 font-medium">Бонус</h1>
                  <span className="textSmall1 text-thin-secondary">сум</span>
                </div>
                <Input
                  type="text"
                  placeholder="0"
                  inputMode="numeric"
                  value={toNonNegativeNumber(orderData?.pay_bonus)}
                  onChange={(e) => handleBonusChange(e.target.value)}
                  className="h-9 w-full rounded-md border border-input px-3 text-base"
                />
              </div>
            )}

            <div className="rounded-md border border-border bg-background p-2">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h1 className="textSmall2 font-medium">Сертификат</h1>
                <span className="textSmall1 text-thin-secondary">сум</span>
              </div>
              <Input
                type="text"
                placeholder="0"
                inputMode="numeric"
                value={toNonNegativeNumber(orderData?.pay_sertificate)}
                onChange={(e) => handleCertificateChange(e.target.value)}
                className="h-9 w-full rounded-md border border-input px-3 text-base"
              />
            </div>
          </section>
          <div className="border-t px-4 py-3">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-thin-secondary">Остаток</span>
              <span className="font-semibold">{remainingAmount} сум</span>
            </div>
            <Button
              type="button"
              className="w-full bg-primary hover:bg-primary"
              onClick={() => setIsPaymentDialogOpen(false)}
            >
              Готово
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};
