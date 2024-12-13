"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

// Cargar el componente dinámicamente para evitar problemas con el lado del servidor
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
});

// Icono personalizado para los marcadores del mapa
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Event {
  _id: string;
  nombre: string;
  lugar: string;
  lat: number;
  lon: number;
}

interface MapProps {
  location: { lat: number; lon: number };
  eventos: Event[];
}

const RecenterAutomatically = ({ location }: { location: { lat: number; lon: number } }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([location.lat, location.lon]);
  }, [location, map]);
  return null;
};

const EventMap: React.FC<MapProps> = ({ location, eventos }) => {
  const [zoom, setZoom] = useState(13);
  useEffect(() => {
    if (location.lat && location.lon) {
      setZoom(13);
    }
  }, [location]);

  return (
    <MapContainer
      center={[location.lat, location.lon]}
      zoom={zoom}
      style={{ height: "400px", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {eventos.map((evento) => (
        <Marker key={evento._id} position={[evento.lat, evento.lon]} icon={customIcon}>
          <Popup>
            <strong>{evento.nombre}</strong>
            <br />
            {evento.lugar}
          </Popup>
        </Marker>
      ))}
      <RecenterAutomatically location={location} />
    </MapContainer>
  );
};

export default EventMap;