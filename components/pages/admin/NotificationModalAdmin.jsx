"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import React, { useEffect, useState } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Check, Eye, OctagonX, PackagePlus, X } from "lucide-react";
import Link from "next/link";
import useProductStore, { orderCreateInfo, useEvent } from "@/store/event";
import useAudio from "@/hooks/use-audio";
import { AdminNewOrderToast, formatCreationTime } from "@/lib/functions";
import axios from "axios";
import Loader from "@/components/shared/loader";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotificationModalAdmin({ products }) {
  const updateOrder = 12;
  const orderData = useQuery(api.order.getByStatus, { status: "bot" }) || [];
  const { discounts: discount } = useProductStore();
  const {
    setSearchClientValue,
    setClients,
    setClientInfoData,
    setReflesh,
    setActiveTab,
  } = useEvent();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { setOrderData, orderData: orderCheck } = orderCreateInfo();
  const {
    setProducts,
    setProductsData,
    setDiscountsProduct,
    resetProduct,
    removeDiscount,
  } = useProductStore();
  const { playSound } = useAudio();
  const [branches, setBranches] = useState([]);
  const router = useRouter();
  const handleClick = async (order) => {
    setProductsData([]);
    setDiscountsProduct([]);
    setLoading(true);
    try {
      console.log(order);
      setReflesh();
      let { data: clientData } = await axios.get(
        `/api/client?id=${order?.client_id}`
      );

      if (order?.address) {
        clientData = {
          ...clientData,
          client: {
            ...clientData?.client,
            address: order?.address,
          },
        };
      }

      let filterProducts = products
        ?.filter((pr) => {
          // Check if product exists in order.products
          const findProduct = order?.products?.find(
            (op) => +op?.product_id === +pr?.product_id
          );
          // Return true if product is found in order
          return !!findProduct;
        })
        .flatMap((pr) => {
          const orderProduct = order.products.find(
            (op) => +op.product_id === +pr.product_id
          );
          const productCount = orderProduct?.count || pr.count || 1;

          // Create an array with length equal to count and map to individual products
          return Array.from({ length: productCount }, () => ({
            ...pr,
            count: 1, // Each split product has count of 1
            promotion_id: orderProduct?.promotion_id || pr.promotion_id || null,
          }));
        });

      console.log(filterProducts, "filterProducts");

      if (filterProducts.length > 0) {
        filterProducts.map((prd) => {
          return setProducts(prd);
        });
        // const filterProductData = filterProducts.filter((prd) => {
        //   if (Number(prd.promotion_id) > 0) {
        //     return false;
        //   } else {
        //     return true;
        //   }
        // });
        // if (filterProductData?.length > 0) {
        //   setProductsData(filterProductData);
        // } else {
        //   setProductsData([]);
        // }
        let orderComment = order?.comment;

        if (clientData?.client?.comment) {
          orderComment = orderComment + " " + clientData?.client?.comment;
        }
        if (order?.bonus) {
          orderComment = `Бонус: ${order?.bonus} сум ,${orderComment}`;
        }
        if (order?.payment_method == "Наличными") {
          orderComment = `Оплата наличными, ${orderComment}`;
        }
        if (order?.payment_method == "Карта") {
          orderComment = `Оплата картой, ${orderComment}`;
        }
        setSearchClientValue(`${order?.phone}`);
        setClientInfoData(clientData);
        setOrderData({
          _id: order?._id,
          spot_id: order?.spot_id ? Number(order?.spot_id) : 0,
          spot_name: order?.spot_id
            ? branches?.find((spot) => spot?.spot_id == order?.spot_id)?.name
            : "",
          phone: order?.phone,
          service_mode: order?.service_mode,
          payment_method: order?.payment_method,
          total: order?.total,
          chat_id: order?.chat_id,
          location: order?.location,
          status: "bot",
          serviceOption:
            order?.service_mode == 2
              ? {
                  name: "Навынос",
                  service_mode: 2,
                }
              : {
                  name: "Доставка",
                  service_mode: 3,
                },
          client: clientData,
          delivery_price: 0,
          pers_num: order?.pers_num,
          comment: orderComment,
          address: order?.address,
          promocode: order?.promocode,
          pay_cash: order?.payment_method == "Наличными" ? order?.total : 0,
          pay_card: order?.payment_method == "Карта" ? order?.total : 0,
        });

        // const filterDiscount = filterProducts?.filter((pr) => pr.promotion_id);
        // console.log({ filterDiscount });

        // if (filterDiscount.length > 0) {
        //   filterDiscount?.map((fp) => {
        //     const findDiscount = discount?.find(
        //       (pr) => +pr?.promotion_id === +fp?.promotion_id
        //     );
        //     console.log({ findDiscount });

        //     if (findDiscount) {
        //       setDiscountsProduct(fp, {
        //         ...findDiscount,
        //         active: true,
        //       });
        //     }
        //   });
        // } else {
        //   setDiscountsProduct();
        // }
      }
    } catch (error) {
    } finally {
      setIsOpen(false);
      setLoading(false);
    }
  };
  const handleResetOrder = () => {
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
    setActiveTab(1);
    setSearchClientValue("");
    router.push("/admin/add-order?topCategory=true");
  };
  const handleCancel = async (order) => {
    setLoading(true);
    try {
      console.log(order, "bot");
      console.log(orderCheck, "bot order");
      const { _id } = order;
      await axios.patch("/api/order", {
        _id,
        status: "cancelled",
      });
      if (
        orderCheck.status == "bot" &&
        order?.client_id == orderCheck?.client?.client?.client_id
      ) {
        setIsOpen(false);
        handleResetOrder();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderData.length > 0) {
      console.log(orderData)
      AdminNewOrderToast(orderData?.length);
      playSound("notification.mp3");
    }
    (async () => {
      try {
        const client = await axios.get("/api/client");
        const { data: branches } = await axios.get(`/api/branch`);
        setBranches(branches.data);
        setClients(client.data);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    })();
  }, [orderData]);

  if (isLoading) return <Loader />;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          onClick={() => setIsOpen(true)}
          data-count={orderData?.length}
          className={`${
            orderData.length > 0 && "notf-count"
          } relative p-3 rounded-full hover:bg-secondary-foreground transition-all duration-300 ease-linear`}
        >
          <IoMdNotificationsOutline className="text-gray-500 text-2xl" />
        </button>
      </SheetTrigger>
      <SheetContent
        className="p-0"
        isClose={true}
        onClose={() => setIsOpen(false)}
      >
        <SheetHeader>
          <SheetTitle className="border-border border-b-2 py-3 px-2">
            Уведомления
          </SheetTitle>
          <div className="relative px-2 pb-3 flex justify-start items-start gap-3 flex-col h-[calc(100vh-60px)] overflow-y-scroll">
            {orderData?.length > 0 ? (
              <>
                {loading && (
                  <div className="bg-neutral-800 text-white font-bold opacity-50 flex justify-center items-center absolute top-0 left-0 w-full h-[calc(100vh-65px)]">
                    Загрузка...
                  </div>
                )}
                {orderData?.map((order, idx) => (
                  <div
                    key={order._id}
                    className="cursor-pointer flex gap-4 justify-start items-center px-2 py-1 rounded-md border-2 border-border w-full"
                  >
                    <PackagePlus size={32} className="text-primary" />
                    <div className="w-full space-y-1">
                      <div className="flex justify-between items-center gap-2">
                        <h1 className="textSmall3 font-bold text-thin">
                          Заказ №{order?.order_num}
                        </h1>
                        <h1 className="textSmall1 font-bold text-thin">
                          {order?.phone}
                        </h1>
                      </div>
                      <div className="flex w-full justify-between items-center">
                        <div className="textSmall1">
                          {order?.service_mode == 2 ? (
                            <h1>Навынос</h1>
                          ) : (
                            order?.service_mode == 3 && <h1>Доставка</h1>
                          )}
                        </div>
                        <p className="textSmall1">Через бота</p>
                      </div>
                      <div className="flex justify-end items-center gap-3 w-full">
                        <Link
                          className="w-full"
                          href={`/admin/add-order?client=${order?.client_id}`}
                        >
                          <Button
                            href={`/admin/add-order?client=${order?.client_id}`}
                            onClick={() => handleClick(order)}
                            variant="ghost"
                            className="p-0 h-8 w-full border border-input"
                          >
                            <Eye size={321} />
                            обзор
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleCancel(order)}
                          variant="ghost"
                          className=" bg-red-500 hover:bg-red-400 hover:text-white text-white p-0 h-8 w-full border border-input"
                        >
                          <X size={32} />
                          отмена
                        </Button>
                      </div>
                      <span className="w-full flex justify-end text-end font-medium text-sm">
                        {formatCreationTime(order?._creationTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="w-full h-full gap-2 flex font-bold text-yellow-500 textSmall3">
                <OctagonX />
                <h1 className="font-bold text-yellow-500 textSmall3">
                  Уведомления недоступны!!!
                </h1>
              </div>
            )}
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

// const AddOrder = ({ order, loading, branches, discount }) => {
//   const [isOpen, setIsOpen] = useState(false); // State to manage dialog open/close
//   const [isLoading, setIsLoading] = useState(false); // State to manage dialog open/close
//   const [orderData, setOrderData] = useState(order ? order : {}); // State to manage

//   const handleSubmit = async () => {
//     setIsLoading(true);

//     try {
//       const { data: client } = await axios.get(
//         `/api/client?id=${orderData?.client_id}`
//       );

//       if (client && client[0]) {
//         const { lastname, firstname, address, addresses } = client[0];
//         const clientAddress =
//           address || addresses[0]?.address1 || "No address available";

//         const { data } = await axios.post(`/api/order`, {
//           ...orderData,
//           client_name: `${lastname} ${firstname}`,
//           address: clientAddress,
//           status: "bot-creating",
//         });

//         if (data) {
//           toast.success("Заказ выполнен успешно!");
//           setIsOpen(false);
//         }
//       } else {
//         toast.error("Клиент не найден!");
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Ошибка при выполнении заказа!");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       <Dialog open={isOpen} onOpenChange={setIsOpen}>
//         <DialogTrigger asChild>
//           <div
//             onClick={() => setIsOpen(true)}
//             key={orderData._id}
//             className="cursor-pointer flex gap-4 justify-start items-center px-2 py-1 rounded-md border-2 border-border w-full"
//           >
//             <PackagePlus size={32} className="text-primary" />
//             <div className="w-full">
//               <h1 className="textSmall3 font-bold text-thin">
//                 {orderData?.phone}
//               </h1>
//               <div className="flex w-full justify-between items-center">
//                 <div className="textSmall1">
//                   {orderData?.service_mode == 2 ? (
//                     <h1>Навынос</h1>
//                   ) : (
//                     orderData?.service_mode == 3 && <h1>Доставка</h1>
//                   )}
//                 </div>
//                 <p>Через бота</p>
//               </div>
//             </div>
//           </div>
//         </DialogTrigger>
//         <DialogContent
//           isClose={isOpen}
//           onClose={() => setIsOpen(false)}
//           className="min-w-[900px] max-h-screen bg-transparent p-0 border-0 overflow-y-scroll py-4 no-scrollbar"
//         >
//           {loading ? (
//             <div className="flex justify-center items-center gap-2">
//               <Loader />
//               <p className="text-center textNormal2 text-thin">Загрузка...</p>
//             </div>
//           ) : (
//             <main className="bg-background space-y-2 py-6 px-4 rounded-md">
//               <DialogHeader>
//                 <DialogTitle asChild>
//                   <h1 className="textNormal3 text-thin text-center">
//                     Новый Заказ
//                   </h1>
//                 </DialogTitle>
//                 <DialogDescription></DialogDescription>
//               </DialogHeader>
//               <main className="grid grid-cols-2 gap-3">
//                 <OrderCheck
//                   discount={discount}
//                   products={order?.products}
//                   orderData={order}
//                 />
//                 <OrderMap
//                   orderData={orderData}
//                   setOrderData={setOrderData}
//                   branches={branches}
//                 />
//                 <TotalInfo orderData={orderData} setOrderData={setOrderData} />
//                 <section className="col-span-2 flex justify-center items-center gap-2">
//                   <Button
//                     disabled={isLoading}
//                     onClick={handleSubmit}
//                     className={`${isLoading && "opacity-70"} bg-white border-[1px] shadow-sm flex justify-start items-center gap-2 w-40`}
//                   >
//                     {isLoading ? (
//                       <Loader />
//                     ) : (
//                       <Image src={sendIcon} alt="send" />
//                     )}
//                     <h1 className="textSmall2 text-primary font-bold">
//                       Отправить
//                     </h1>
//                   </Button>
//                   <Button
//                     className="bg-white border-[1px] shadow-sm flex justify-start items-center gap-2 w-40"
//                     onClick={() => setIsOpen(false)} // Close dialog on cancel
//                   >
//                     <Image src={closeIcon} alt="close" />
//                     <h1 className="textSmall2 text-red-600 font-bold">
//                       Отмена
//                     </h1>
//                   </Button>
//                 </section>
//               </main>
//             </main>
//           )}
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// const OrderMap = ({ orderData, setOrderData, branches }) => {
//   const defaultCoordinates = [41.311158, 69.279737];
//   const [coordinates, setCoordinates] = useState(defaultCoordinates); // Marker coordinates
//   const [mapCenter, setMapCenter] = useState(defaultCoordinates); // Map center coordinates
//   const [mapZoom, setMapZoom] = useState(10);

//   const handleAddBranch = (branch) => {
//     setOrderData({
//       ...orderData,
//       spot_id: branch.spot_id,
//       spot_name: branch?.name,
//     });
//   };

//   useEffect(() => {
//     const { latitude, longitude } = orderData?.location;
//     if (longitude !== 0 && longitude != 0) {
//       setCoordinates([latitude, longitude]);
//       setMapCenter([latitude, longitude]);
//     } else {
//       setCoordinates(null);
//     }
//   }, []);

//   return (
//     <main className="col-span-1 space-y-2">
//       <section className="shadow-custom p-4">
//         <h1 className="text-center font-bold text-thin">Локация</h1>
//         <div className="border-border border-2 rounded-md h-[350px] w-full">
//           <YMaps query={{ apikey: apiKeyYandex }}>
//             <Map
//               width="100%"
//               height="100%"
//               state={{ center: mapCenter, zoom: mapZoom }}
//             >
//               {coordinates && (
//                 <Placemark
//                   geometry={coordinates}
//                   options={{
//                     iconLayout: "default#image",
//                     iconImageHref:
//                       "https://fkkpuaszmvpxjoqqmlzx.supabase.co/storage/v1/object/public/wassabi/1365700-removebg-preview.png",
//                     iconImageSize: [40, 40],
//                     iconImageOffset: [-20, -40],
//                   }}
//                   properties={{
//                     balloonContentHeader: `Клиент с адресом`,
//                     balloonContentBody: `<div>${`Клиент с адресом`}</div>`,
//                     hintContent: `Клиент с адресом`,
//                   }}
//                   modules={["geoObject.addon.balloon", "geoObject.addon.hint"]}
//                 />
//               )}
//               {branches.length > 0 && (
//                 <>
//                   {branches.map((branch, idx) => (
//                     <Placemark
//                       key={idx}
//                       geometry={[+branch?.lat, +branch?.lng]}
//                       options={{
//                         iconLayout: "default#image",
//                         iconImageHref:
//                           branch?.spot_id == orderData?.spot_id
//                             ? "https://fkkpuaszmvpxjoqqmlzx.supabase.co/storage/v1/object/public/wassabi/wassabi-location.png"
//                             : "https://fkkpuaszmvpxjoqqmlzx.supabase.co/storage/v1/object/public/wassabi/food.png", // Ensure this path is correct
//                         iconImageSize:
//                           branch?.spot_id == orderData?.spot_id
//                             ? [40, 40]
//                             : [35, 35], // Make sure these sizes are appropriate for your image
//                         iconImageOffset:
//                           branch?.spot_id == orderData?.spot_id
//                             ? [-20, -20]
//                             : [-17.5, -17.5], // Adjust if necessary
//                       }}
//                       properties={{
//                         balloonContentHeader: branch.name,
//                         balloonContentBody: `<div>${branch.name}</div>`,
//                         hintContent: branch.name,
//                       }}
//                       modules={[
//                         "geoObject.addon.balloon",
//                         "geoObject.addon.hint",
//                       ]}
//                     />
//                   ))}
//                 </>
//               )}
//               <ZoomControl options={{ float: "right" }} />
//             </Map>
//           </YMaps>
//         </div>
//       </section>
//       <section className="shadow-custom p-4 space-y-2">
//         <h1 className="text-center font-bold text-thin">Выбрать филиал</h1>
//         {branches?.map((item, i) => (
//           <div
//             onClick={() => handleAddBranch(item)}
//             key={i}
//             className={`${+item?.spot_id == +orderData?.spot_id ? "bg-primary" : "bg-thin-secondary"} py-1 px-2 rounded-md cursor-pointer text-white border-border w-full flex justify-between items-center gap-3 `}
//           >
//             <h1 className="textSmall2 border-r-2 w-3/4">{item?.name}</h1>
//             <p className="w-1/4 text-center textSmall1">
//               <span className="textSmall3"> 12</span> <br />
//               Кол.ож. заказ
//             </p>
//           </div>
//         ))}
//       </section>
//     </main>
//   );
// };

// const OrderCheck = ({ orderData, products, deliveryPrice, discount }) => {
//   return (
//     <main className="col-span-1 shadow-custom p-4 rounded-md flex justify-between items-start flex-col">
//       <table className="w-full">
//         <thead>
//           <tr>
//             <th className="text-thin px-2 textSmall1 py-1 text-left">
//               Наименование
//             </th>
//             <th className="text-thin px-2 textSmall1 py-1 text-center">
//               Кол-во
//             </th>
//             <th className="text-thin px-2 textSmall1 py-1 text-right">Цена</th>
//             <th className="text-thin px-2 textSmall1 py-1 text-right">Итого</th>
//           </tr>
//         </thead>
//         <tbody>
//           {products?.map((item, index) => {
//             const productDiscount = discount?.find(
//               (d) => d.promotion_id == item.promotion_id
//             );

//             const renderRow = (name, count, price) => {
//               let prs;
//               if (productDiscount?.params?.result_type == 2) {
//                 prs = Math.max(
//                   0,
//                   price - productDiscount.params.discount_value
//                 );
//               } else if (productDiscount?.params?.result_type == 3) {
//                 prs =
//                   (price * (100 - productDiscount.params.discount_value)) / 100;
//               } else {
//                 prs = price;
//               }
//               return (
//                 <tr key={`${index}-${name}`} className="border-b">
//                   <td className="text-foreground px-2 py-1 textSmall2 text-left">
//                     {name}
//                   </td>
//                   <td className="text-thin px-2 py-1 textSmall2 text-center">
//                     {count}
//                   </td>
//                   <td className="text-thin px-2 py-1 textSmall2 text-right">
//                     <h1 className=""> {prs} </h1>
//                     {productDiscount && (
//                       <p className="textSmall1 line-through">{price} </p>
//                     )}
//                     сум
//                   </td>
//                   <td className="text-thin px-2 py-1 textSmall2 text-right">
//                     <h1>{prs * count}</h1>
//                     сум
//                   </td>
//                 </tr>
//               );
//             };

//             if (item?.modifications?.length > 0) {
//               return (
//                 <React.Fragment key={index}>
//                   {item.modifications.map((m, i) =>
//                     renderRow(
//                       `${item.product_name} ${m.modificator_name}`,
//                       m.count,
//                       Number(m?.spots[0]?.price) / 100
//                     )
//                   )}
//                 </React.Fragment>
//               );
//             } else {
//               return renderRow(
//                 item.product_name,
//                 item.count,
//                 Number(item?.price)
//               );
//             }
//           })}
//         </tbody>
//       </table>
//       <ul className="w-full textSmall2 space-y-2 mt-4 text-thin">
//         <li className="flex justify-between items-center gap-3">
//           <h1 className="col-span-1">Товар:</h1>
//           <span className="col-span-2"></span>
//         </li>
//         <li className="flex justify-between items-center gap-3">
//           <h1 className="col-span-1">Акция:</h1>
//           <span className="col-span-2">Специальная скидка</span>
//         </li>
//         <li className="flex justify-between items-center gap-3">
//           <h1 className="col-span-1">Сумма доставки:</h1>
//           <span className="col-span-2">{deliveryPrice} сум</span>
//         </li>
//         <li className="font-bold flex justify-between items-center gap-3">
//           <h1 className="col-span-1">Сумма заказа:</h1>
//           <span className="col-span-2">{orderData?.total} сум</span>
//         </li>
//       </ul>
//     </main>
//   );
// };

// const TotalInfo = ({ orderData, setOrderData, totalSum }) => {
//   const [paymentData, setPaymentData] = useState([
//     {
//       type: "Наличными",
//       title: "Наличными",
//       value: orderData?.payment_method === "Наличными" ? orderData?.total : 0,
//     },
//     {
//       type: "Карта",
//       title: "Пластиковой картой",
//       value: orderData?.payment_method === "Карта" ? orderData?.total : 0,
//     },
//   ]);

//   useEffect(() => {
//     setPaymentData([
//       {
//         type: "Наличными",
//         title: "Наличными",
//         value: orderData?.payment_method === "Наличными" ? orderData?.total : 0,
//       },
//       {
//         type: "Карта",
//         title: "Пластиковой картой",
//         value: orderData?.payment_method === "Карта" ? orderData?.total : 0,
//       },
//     ]);
//   }, [orderData, totalSum]);

//   return (
//     <main className="col-span-2 flex justify-around gap-3 shadow-custom p-4">
//       <section className="w-full space-y-3">
//         <div className="space-y-1 border-b-[1px] py-1">
//           <h1 className="textSmall2 text-thin-secondary">Клиент оплатил</h1>
//           <p className="textNormal1">0 сум</p>
//         </div>
//         <div className="space-y-1 border-b-[1px] py-1">
//           <h1 className="textSmall2 text-thin-secondary">К оплате</h1>
//           <p className="textNormal1">{orderData?.total} сум</p>
//         </div>
//         <div className="space-y-1 border-b-[1px] py-1">
//           <h1 className="textSmall2 text-thin-secondary">Способ оплаты</h1>
//           <p className="textNormal1">{orderData?.payment_method}</p>
//         </div>
//       </section>
//       <section className="h-full w-[2px] bg-border" />
//       <section className="w-full space-y-2">
//         {paymentData.map((pay, i) => (
//           <div
//             onClick={() =>
//               setOrderData({ ...orderData, payment_method: pay?.type })
//             }
//             key={i}
//             className={`${pay?.type == orderData?.payment_method ? "bg-primary" : "bg-thin-secondary"} p-2 rounded-md cursor-pointer text-white border-border w-full flex justify-between items-center gap-3`}
//           >
//             {/* Наличными */}
//             <h1 className="textSmall2 border-r-2 w-1/2">{pay.title}</h1>
//             <p className="w-1/2 text-center textSmall1">{pay.value} сум</p>
//           </div>
//         ))}
//       </section>
//     </main>
//   );
// };
