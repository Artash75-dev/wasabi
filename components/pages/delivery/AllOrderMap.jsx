"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { apiKeyYandex } from "@/lib/utils";
import {
  Map,
  YMaps,
  Placemark,
  ZoomControl,
} from "@pbe/react-yandex-maps";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ImExit } from "react-icons/im";
import { exitToast } from "@/lib/functions";

// URLs and other constants
const DEFAULT_COORDINATES = [41.318414, 69.334156];
const USER_ICON = "https://wasabi-admin.onrender.com/_next/image?url=%2Ficons%2Fbranch1.png&w=96&q=75";
const BRANCH_ICON = "https://wasabi-admin.onrender.com/_next/image?url=%2Ficons%2Fuser.png&w=96&q=75";

function AllOrderMap({ status, height, handleClose }) {
  const [coordinates, setCoordinates] = useState(DEFAULT_COORDINATES);
  const [locationAvailable, setLocationAvailable] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const router = useRouter();

  const orderData = useQuery(api.order.get) || [];

  const orderFilter = useMemo(() => orderData.filter(order => order.status === "waiting"), [orderData]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          const userCoordinates = [latitude, longitude];
          setCoordinates(userCoordinates);
          setLocationAvailable(true);
          mapInstance?.setCenter(userCoordinates, 12);
        },
        () => setLocationAvailable(false)
      );
    } else setLocationAvailable(false);
  };

  const showBranches = () => {
    if (mapInstance && orderFilter.length) {
      const bounds = orderFilter.map(({ location }) => [location.latitude, location.longitude]);
      mapInstance.setBounds(bounds, { checkZoomRange: true, zoomMargin: status === "simple" ? 100 : 190 });
    }
  };

  const handleMarkerClick = (branchId) => {
    router.push(`/delivery/${branchId}`);
    handleClose();
  };

  return (
    <YMaps query={{ apikey: apiKeyYandex }}>
      <div className={`${status === "simple" ? "" : "flex"} flex justify-center flex-col items-center gap-3 py-3`}>
        <h1>Карта заказов</h1>
        <div className={`${status === "simple" ? "" : "flex"} flex justify-center items-center gap-3 mb-4`}>
          <Button onClick={getUserLocation}>Determine Location</Button>
          <Button onClick={showBranches}>Show Branches</Button>
        </div>
      </div>
      <Map
        defaultState={{ center: coordinates, zoom: 12 }}
        width="100%"
        height={status === "simple" ? "150px" : "100%"}
        instanceRef={setMapInstance}
      >
        {locationAvailable && (
          <Placemark
            geometry={coordinates}
            options={{
              iconLayout: "default#image",
              iconImageHref: USER_ICON,
              iconImageSize: [70, 70],
              iconImageOffset: [-35, -17.5],
            }}
            properties={{ balloonContent: "Your Location" }}
          />
        )}
        {orderFilter.map(({ _id, location, client }) => (
          <Placemark
            key={_id}
            geometry={[location.latitude, location.longitude]}
            options={{
              iconLayout: "default#image",
              iconImageHref: BRANCH_ICON,
              iconImageSize: [50, 50],
              iconImageOffset: [-25, -15],
            }}
            properties={{
              balloonContentHeader: client?.address || client?.first_name,
              balloonContentBody: `<div>${client?.address || client?.first_name}</div>`,
              hintContent: client?.address || client?.first_name,
            }}
            modules={["geoObject.addon.balloon", "geoObject.addon.hint"]}
            onClick={() => handleMarkerClick(_id)}
          />
        ))}
        <ZoomControl options={{ float: "right" }} />
      </Map>
    </YMaps>
  );
}

export default function Footer() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const toggleDialog = () => setIsOpen(prev => !prev);

  if (!pathname.includes("delivery")) return null;

  return (
    <footer className="fixed bottom-0 left-0 flex justify-center items-center w-screen bg-secondary min-h-32 shadow-custom">
      <div className="relative w-full h-full">
        <AllOrderMap status="simple" height="150px" />
        <div className="flex justify-center items-center absolute top-0 left-0 w-full h-full bg-white/50">
          <div className="font-bold textSmall4 cursor-pointer" onClick={toggleDialog}>
            Открыть карту
          </div>
          <div onClick={exitToast} className="absolute right-3 bottom-3 p-3 bg-red-300 rounded-full flex justify-center items-center cursor-pointer">
            <ImExit className="text-2xl text-red-600 ml-1" />
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} as="div" className="relative z-[400]" onClose={toggleDialog}>
            <div className="fixed inset-0 z-[300] bg-black/50 w-screen overflow-y-auto">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex min-h-full items-end justify-center"
              >
                <DialogPanel className="w-full h-[calc(100vh-80px)] rounded-t-md bg-white shadow-lg flex justify-between flex-col">
                  <AllOrderMap height="400px" handleClose={toggleDialog} />
                </DialogPanel>
              </motion.div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </footer>
  );
}
y