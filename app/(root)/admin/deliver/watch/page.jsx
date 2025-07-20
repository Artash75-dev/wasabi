"use client";

import Container from "@/components/shared/container";
import React, { useEffect, useState } from "react";
import { apiKeyYandex } from "@/lib/utils";
import { Map, YMaps, Placemark, ZoomControl } from "@pbe/react-yandex-maps";
import { useSocketDeliverContext } from "@/providers/SocketDeliverContext";
import axios from "axios";
import { Loader } from "lucide-react";
// URLs and other constants
const DEFAULT_COORDINATES = [41.318414, 69.334156];
const USER_ICON =
  "https://wasabi-admin.onrender.com/_next/image?url=%2Ficons%2Fdeliver.png&w=96&q=75";
const WatchLive = () => {
  const { socket } = useSocketDeliverContext();
  const [coordinates, setCoordinates] = useState(DEFAULT_COORDINATES);
  const [locations, setLocations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    function getCouriers(data) {
      setLocations(data); // Update courier locations
    }

    socket?.on("getLocations", getCouriers);
    return () => {
      socket?.off("getLocations", getCouriers);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/branch`);
        setBranches(data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Listen for location updates from the server
    function updateCouriers(data) {
      console.log("it works", data);
      setLocations(data); // Update courier locations
    }
    socket?.on("locationsUpdate", updateCouriers);

    return () => {
      socket?.off("locationsUpdate", updateCouriers);
    };
  }, [socket]);
  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-240px)] flex justify-center items-center gap-2">
        <Loader />
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <Container
      className={"mt-24 flex flex-col gap-4 justify-start items-start mb-4"}
    >
      <h1 className="textNormal3 font-bold">Живое отслеживание курьеров</h1>
      <section className="w-full h-[calc(100vh-165px)] border border-input rounded-md">
        <YMaps query={{ apikey: apiKeyYandex }}>
          <Map
            defaultState={{ center: coordinates, zoom: 12 }}
            width="100%"
            height="100%"
          >
            {locations?.map(({ _id, lat, lng, name, email }) => (
              <Placemark
                key={_id}
                geometry={[lat, lng]}
                options={{
                  iconLayout: "default#image",
                  iconImageHref: USER_ICON,
                  iconImageSize: [60, 60],
                  iconImageOffset: [-30, -25],
                }}
                properties={{
                  balloonContentHeader: name,
                  balloonContentBody: `<div>${email}</div>`,
                  hintContent: name,
                }}
                modules={["geoObject.addon.balloon", "geoObject.addon.hint"]}
              />
            ))}
            {branches.length > 0 && (
              <>
                {branches.map((branch, idx) => (
                  <Placemark
                    key={idx}
                    geometry={[+branch?.lat, +branch?.lng]}
                    options={{
                      iconLayout: "default#image",
                      iconImageHref:
                        "https://wasabi-admin.onrender.com/_next/image?url=%2Ficons%2Fbranch1.png&w=96&q=75", // Ensure this path is correct
                      iconImageSize: [60, 60], // Make sure these sizes are appropriate for your image
                      iconImageOffset: [-30, -30], // Adjust if necessary
                    }}
                    properties={{
                      balloonContentHeader: branch.name,
                      balloonContentBody: `<div>${branch.name}</div>`,
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
      </section>
    </Container>
  );
};

export default WatchLive;
