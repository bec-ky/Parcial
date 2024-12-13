'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

const EditarEvento = () => {
  const router = useRouter();
  const { id } = useParams();
  const [evento, setEvento] = useState({
    nombre: '',
    fecha: '',
    lugar: '',
    organizador: '',
  });

  useEffect(() => {
    if (id) {
      fetch(`/api/eventos/${id}`)
        .then((response) => response.json())
        .then((data) => setEvento({
          nombre: data.nombre || '',
          fecha: data.fecha || '',
          lugar: data.lugar || '',
          organizador: data.organizador || '',
        }))
        .catch((error) => console.error('Error al cargar el evento:', error));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEvento((prevEvento) => ({
      ...prevEvento,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/eventos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evento),
      });
      if (response.ok) {
        router.push('/');
      } else {
        console.error('Error al actualizar el evento');
      }
    } catch (error) {
      console.error('Error al actualizar el evento:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Evento</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Nombre del Evento</label>
          <input
            type="text"
            name="nombre"
            value={evento.nombre}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Fecha</label>
          <input
            type="datetime-local"
            name="fecha"
            value={evento.fecha}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Lugar</label>
          <input
            type="text"
            name="lugar"
            value={evento.lugar}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Organizador</label>
          <input
            type="text"
            name="organizador"
            value={evento.organizador}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};

export default EditarEvento;