'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { use } from 'react';

interface Evento {
  _id: string;
  nombre: string;
  timestamp: string;
  lugar: string;
  lat: number;
  lon: number;
  organizador: string;
  imagen: string;
}

async function getEvento(id: string): Promise<Evento> {
  const res = await fetch(`/api/eventos/${id}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Error al cargar el evento');
  }
  
  return res.json();
}

export default function EventoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = use(params);

  useEffect(() => {
    getEvento(id)
      .then(setEvento)
      .catch(err => setError(err.message));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres borrar este evento?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/eventos/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Error al borrar el evento');
      }
    } catch (err) {
      setError('Error al borrar el evento');
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!evento) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-2xl">
        <Link href="/" className="text-blue-500 mb-4 block">
          ← Volver
        </Link>
        
        <h1 className="text-2xl font-bold mb-4">{evento.nombre}</h1>
        
        <div className="mb-8">
          <img 
            src={evento.imagen} 
            alt={evento.nombre}
            className="w-full h-64 object-cover rounded"
          />
        </div>

        <div className="grid gap-4 mb-8">
          <p><strong>Fecha:</strong> {new Date(evento.timestamp).toLocaleString()}</p>
          <p><strong>Lugar:</strong> {evento.lugar}</p>
          <p><strong>Organizador:</strong> {evento.organizador}</p>
        </div>

        {session?.user?.email === evento.organizador && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300"
          >
            {isDeleting ? 'Borrando...' : 'Borrar evento'}
          </button>
        )}
      </div>
    </main>
  );
}