import { NextResponse } from "next/server";
import Evento from "@/models/Evento";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const evento = await Evento.findById(id);

    if (!evento) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    return NextResponse.json(evento);
  } catch (error) {
    console.error("Error al obtener el evento:", error);
    return NextResponse.json({ error: "Error al obtener el evento" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const evento = await Evento.findById(id);
    if (!evento) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // Verificar que el usuario es el organizador
    if (evento.organizador !== session.user.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const formData = await request.formData();
    const nombre = formData.get("nombre") as string;
    const timestamp = formData.get("timestamp") as string;
    const lugar = formData.get("lugar") as string;
    const imagen = formData.get("imagen") as File;

    // Procesar nueva imagen si se proporciona
    let imagenUrl = evento.imagen;
    if (imagen) {
      const bytes = await imagen.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const response = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_type: "image" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(buffer);
      });
      imagenUrl = (response as { secure_url: string }).secure_url;
    }

    // Obtener coordenadas del lugar
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      lugar
    )}&format=json&limit=1`;

    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    let lat = evento.lat;
    let lon = evento.lon;

    if (geocodeData && geocodeData.length > 0) {
      lat = parseFloat(geocodeData[0].lat);
      lon = parseFloat(geocodeData[0].lon);
    }

    const eventoActualizado = await Evento.findByIdAndUpdate(
      id,
      {
        nombre,
        timestamp,
        lugar,
        lat,
        lon,
        imagen: imagenUrl
      },
      { new: true }
    );

    return NextResponse.json(eventoActualizado);
  } catch (error) {
    console.error("Error al actualizar el evento:", error);
    return NextResponse.json(
      { error: "Error al actualizar el evento" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const evento = await Evento.findById(id);
    if (!evento) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // Verificar que el usuario es el organizador
    if (evento.organizador !== session.user.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await Evento.findByIdAndDelete(id);
    return NextResponse.json({ message: "Evento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el evento:", error);
    return NextResponse.json(
      { error: "Error al eliminar el evento" },
      { status: 500 }
    );
  }
}