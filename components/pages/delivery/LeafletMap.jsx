"use client";

import { useState, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { Navigation } from "lucide-react";

// Buyurtmalar uchun marker ikonkasi
const orderIcon = new L.Icon({
  iconUrl:
    "https://fkkpuaszmvpxjoqqmlzx.supabase.co/storage/v1/object/public/wassabi/wassabi-location.png", // URL orqali tasvir
  iconSize: [50, 50], // Hajmi
  iconAnchor: [25, 50], // Aniq joylashuvi
  popupAnchor: [0, -50], // Popup uchun bog'lanish joyi
});

// Foydalanuvchi uchun marker ikonkasi
const userIcon = new L.Icon({
  iconUrl:
    "https://fkkpuaszmvpxjoqqmlzx.supabase.co/storage/v1/object/public/wassabi/DALL_E_2024-09-25_15.04.54_-_Create_a_location_pin_icon_similar_to_the_uploaded_image__with_a_design_tailored_for_couriers._The_pin_should_have_a_light_blue_color_with_a_simple__c-removebg-preview.png", // URL orqali tasvir
  iconSize: [70, 70],
  iconAnchor: [35, 70],
  popupAnchor: [0, -70],
});

export default function LeafletMap({ zoom = 11 }) {
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef();

  const branches = [
    { id: 1, coords: [41.318414, 69.334156], name: "Sushi Order 1" },
    { id: 2, coords: [41.315258, 69.340883], name: "Sushi Order 2" },
    { id: 3, coords: [41.274788, 69.194206], name: "Sushi Order 3" },
  ];

  const handleLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);

        if (mapRef.current) {
          mapRef.current.flyTo(coords, zoom);
        }
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <>
      <MapContainer
        center={[41.318414, 69.334156]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100vh", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {branches.map((branch) => (
          <Marker key={branch.id} position={branch.coords} icon={orderIcon}>
            <Popup>{branch.name}</Popup>
          </Marker>
        ))}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Bu sizning joylashuvingiz</Popup>
          </Marker>
        )}
      </MapContainer>

      <button
        onClick={handleLocation}
        style={{ position: "absolute", bottom: 20, right: 10, zIndex: 1000 }}
        className="p-4 rounded-full bg-primary"
      >
        <Navigation className="text-white" />
      </button>
    </>
  );
}
