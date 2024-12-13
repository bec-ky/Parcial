"use client";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Event {
  _id: string;
  nombre: string;
  timestamp: string;
  lugar: string;
  lat: number;
  lon: number;
  organizador: string;
  imagen: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const showSession = () => {
    if (status === "authenticated") {
      return (
        <div className="flex flex-col items-center gap-4 mb-8">
          <h2>Bienvenido {session?.user?.name}</h2>
          <img src={session?.user?.image ?? undefined} alt={session?.user?.name ?? ""} className="w-20 h-20 rounded-full" />
          <button
            className="border border-solid border-black rounded px-4 py-2"
            onClick={() => {
              signOut({ redirect: false }).then(() => {
                router.push("/");
              });
            }}
          >
            Sign Out
          </button>
        </div>
      )
    } else if (status === "loading") {
      return (
        <span className="text-[#888] text-sm mt-7">Loading...</span>
      )
    } else {
      return (
        <Link
          href="/login"
          className="border border-solid border-black rounded px-4 py-2 mb-8"
        >
          Sign In
        </Link>
      )
    }
  }

  const searchEvents = async () => {
    try {
      setLoading(true);
      
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();

      if (geocodeData && geocodeData.length > 0) {
        const { lat, lon } = geocodeData[0];
        const response = await fetch(`/api/eventos?lat=${lat}&lon=${lon}`);
        if (!response.ok) throw new Error('Error al cargar los eventos');
        
        const data = await response.json();
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      {showSession()}

      <div className="w-full max-w-xl mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Introduce una dirección"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={searchEvents}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
        {events.map((event) => (
          <Link href={`/eventos/${event._id}`} key={event._id}>
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={event.imagen} 
                alt={event.nombre}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="font-bold text-xl mb-2">{event.nombre}</h2>
                <p className="text-gray-600">
                  {new Date(event.timestamp).toLocaleDateString()}
                </p>
                <p className="text-gray-600">{event.lugar}</p>
                <p className="text-gray-600">Organizador: {event.organizador}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}