import {
  Map,
  Placemark,
  YMaps,
  Geocode,
  ZoomControl,
} from "@pbe/react-yandex-maps";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"; // Assuming you're using a styled input component
import axios from "axios";
import { Button } from "@/components/ui/button";
import { apiKeyYandex } from "@/lib/utils";

const ClientMap = ({ updateData, addLocation }) => {
  const defaultCoordinates = [41.311158, 69.279737]; // Default marker coordinates (if location is denied/unavailable)
  const [coordinates, setCoordinates] = useState(defaultCoordinates); // Marker coordinates
  const [mapCenter, setMapCenter] = useState(defaultCoordinates); // Map center coordinates
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [searchResult, setSearchResult] = useState([]); // Search result
  const [showResults, setShowResults] = useState(false); // To manage dropdown visibility
  const [mapZoom, setMapZoom] = useState(14);
  const [isOpen, setIsOpen] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (
      updateData?.location?.latitude != 0 &&
      updateData?.location?.longitude != 0 &&
      updateData?.location?.longitude != undefined &&
      updateData?.location?.latitude != undefined
    ) {
      const { latitude, longitude } = updateData?.location;
      setCoordinates([latitude, longitude]);
      setMapCenter([latitude, longitude]);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setCoordinates(userCoords);
          setMapCenter(userCoords);
        },
        () => {
          setMapCenter(defaultCoordinates);
          setCoordinates(defaultCoordinates);
        }
      );
    }
  }, [updateData]);

  const handleMapClick = (event) => {
    const coords = event.get("coords");
    setCoordinates(coords);
  };

  const handleSubmit = async () => {
    if (searchQuery.length <= 0) {
      return null;
    }
    const geocoder = await axios.get(
      `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKeyYandex}&geocode=${searchQuery}&lang=ru_RU&format=json`
    );
    setSearchResult(
      geocoder?.data?.response?.GeoObjectCollection?.featureMember
    );
    setShowResults(true);
  };

  const handleResultClick = (item) => {
    const coords = item?.GeoObject?.Point?.pos;
    const { name, description } = item.GeoObject;
    setCoordinates([coords.split(" ")[1], coords.split(" ")[0]]);
    setMapCenter([coords.split(" ")[1], coords.split(" ")[0]]);
    setAddress(name + " ," + description);
    setShowResults(false);
    setMapZoom(18);
  };

  const handleSaveLocation = () => {
    if (coordinates.length > 0) {
      const location = {
        latitude: coordinates[0],
        longitude: coordinates[1],
      };

      addLocation(location, address);
      setMapCenter([coordinates[0], coordinates[1]]);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogTrigger asChild>
        <div
          onClick={() => setIsOpen(true)}
          className="relative col-span-2 h-[200px] w-full"
        >
          <div className="absolute border-2 rounded-md overflow-hidden w-full h-full z-10 bg-white/10 cursor-pointer" />
          <YMaps query={{ apikey: apiKeyYandex }}>
            <Map
              width={"100%"}
              height={"100%"}
              state={{ center: mapCenter, zoom: mapZoom }}
            >
              <Placemark
                geometry={coordinates}
                options={{
                  iconLayout: "default#image",
                  iconImageHref:
                    "https://wasabi-admin.onrender.com/_next/image?url=%2Ficons%2Fuser.png&w=96&q=75",
                  iconImageSize: [70, 70],
                  iconImageOffset: [-35, -70],
                }}
                properties={{
                  balloonContent: "Your Location",
                }}
              />
            </Map>
          </YMaps>
        </div>
      </DialogTrigger>
      <DialogContent
        isClose={true}
        onClose={() => {
          setMapCenter([coordinates[0], coordinates[1]]);
          setIsOpen(false);
        }}
        className="w-3/4 h-[610px] max-w-full max-h-full"
      >
        <DialogHeader>
          <DialogTitle>Выберите адрес на карте</DialogTitle>
          <DialogDescription>
            Вы можете найти адрес вручную или кликнуть по карте, чтобы поместить
            его на карту.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 w-full h-full">
          {/* Search input */}
          <div className="relative flex gap-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию места"
            />
            <button onClick={handleSubmit} className="btn-primary">
              Поиск
            </button>

            {/* Search results dropdown */}
            {showResults && searchResult.length > 0 && (
              <div className="absolute top-12 left-0 w-full shadow-custom bg-white h-20 overscroll-y-scroll rounded-md z-10">
                <div className="p-2 space-y-2 shadow-lg bg-white max-h-48 overflow-y-scroll rounded-md">
                  {searchResult.map((item, idx) => (
                    <div
                      onClick={() => handleResultClick(item)}
                      key={idx}
                      className="cursor-pointer flex flex-col gap-1 text-gray-600 px-2 py-1 rounded-md border-input border-2"
                    >
                      <h1 className="font-bold textNormal1">
                        {item?.GeoObject?.name}
                      </h1>
                      <p className="text-thin font-medium textSmall2">
                        {item?.GeoObject?.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-input border-2 rounded-md overflow-hidden">
            <YMaps defaultCoordinates={[42,69]} query={{ apikey: apiKeyYandex }}>
              <Map
                width={"100%"}
                height={"400px"}
                state={{ center: mapCenter, zoom: mapZoom }}
                onClick={handleMapClick}
              >
                <ZoomControl options={{ float: "right" }} />
                <Placemark
                  geometry={coordinates}
                  options={{
                    iconLayout: "default#image",
                    iconImageHref:
                      "https://wasabi-admin.onrender.com/_next/image?url=%2Ficons%2Fuser.png&w=96&q=75",
                    iconImageSize: [70, 70],
                    iconImageOffset: [-35, -70],
                  }}
                  properties={{
                    balloonContent: "Your Location",
                  }}
                />
              </Map>
            </YMaps>
          </div>
          <Button
            onClick={handleSaveLocation}
            className="hover:bg-primary active:opacity-80"
          >
            Сохранять
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientMap;
