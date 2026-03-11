"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"; // ⭐ add this

import { useEffect, useRef } from "react";


// Fix Leaflet marker icons in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const driverIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/808/808168.png",
  iconSize: [40, 40],
});


// HARD RESET ROUTING COMPONENT
function RoutingMachine({ pickupCoords, destCoords }) {

  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {

    // 1️⃣ VALIDATION
    const isValid = (c) =>
      Array.isArray(c) &&
      c.length === 2 &&
      !isNaN(c[0]) &&
      !isNaN(c[1]);

    // 2️⃣ SAFE CLEANUP FUNCTION
    const safeRemove = () => {

      if (routingRef.current && map) {

        try {

          if (map.hasLayer && map.hasLayer(routingRef.current)) {
            map.removeControl(routingRef.current);
          }

        } catch (e) {
          console.warn("Cleanup handled");
        }

        routingRef.current = null;
      }

    };

    // If coords invalid (ride finished etc.)
    if (!isValid(pickupCoords) || !isValid(destCoords)) {
      safeRemove();
      return;
    }

    // 3️⃣ HARD RESET ROUTE
    safeRemove();

    try {

      routingRef.current = L.Routing.control({
  waypoints: [
    L.latLng(pickupCoords[0], pickupCoords[1]),
    L.latLng(destCoords[0], destCoords[1])
  ],
  lineOptions: {
    styles: [{ color: "#000", weight: 4 }]
  },
  addWaypoints: false,
  draggableWaypoints: false,
  show: false
})
.on("routingerror", function () {
  // ⭐ prevents {} routing error from crashing UI
  console.log("Routing path not found yet, waiting for valid coords...");
})
.addTo(map);
    } catch (err) {

      console.error("Routing init error", err);

    }

    // 4️⃣ CLEANUP ON UNMOUNT
    return () => safeRemove();

  }, [map, pickupCoords, destCoords]);

  return null;
}


export default function Map({ center, zoom, driverLocation, pickupCoords, destCoords }) {

  const isValid = (coords) =>
    Array.isArray(coords) &&
    coords.length === 2 &&
    !isNaN(coords[0]) &&
    !isNaN(coords[1]);

  return (

    <MapContainer
      center={center}
      zoom={zoom || 13}
      zoomControl={false}
      className="h-full w-full z-0"
      scrollWheelZoom={true}
    >

      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ZoomControl position="topright" />

      {/* Current Location */}
      {isValid(center) && (
        <Marker position={center} icon={icon}>
          <Popup>Your Location</Popup>
        </Marker>
      )}

      {/* Pickup Marker */}
      {isValid(pickupCoords) && (
        <Marker position={pickupCoords} icon={icon}>
          <Popup>Pickup Location</Popup>
        </Marker>
      )}

      {/* Destination Marker */}
      {isValid(destCoords) && (
        <Marker position={destCoords} icon={icon}>
          <Popup>Destination</Popup>
        </Marker>
      )}

      {/* Driver Marker */}
      {driverLocation &&
        !isNaN(driverLocation[0]) &&
        !isNaN(driverLocation[1]) && (
          <Marker position={driverLocation} icon={driverIcon}>
            <Popup>Driver</Popup>
          </Marker>
        )}

      {/* Route */}
      {isValid(pickupCoords) && isValid(destCoords) && (
        <RoutingMachine
          pickupCoords={pickupCoords}
          destCoords={destCoords}
        />
      )}

    </MapContainer>

  );

}