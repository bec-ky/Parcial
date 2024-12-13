import { NextResponse } from "next/server";
import Evento from "@/models/Evento";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  try {
    await connectDB();
    const eventos = await Evento.find({});
    return NextResponse.json(eventos);
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    return NextResponse.json(
      { error: "Error al obtener eventos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const formData = await req.formData();
    const nombre = formData.get("nombre") as string;
    const timestamp = formData.get("timestamp") as string;
    const lugar = formData.get("lugar") as string;
    const organizador = formData.get("organizador") as string;
    const imagen = formData.get("imagen") as File;

    if (!imagen) {
      return NextResponse.json(
        { error: "No se ha proporcionado una imagen" },
        { status: 400 }
      );
    }

    const bytes = await imagen.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const response = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "image" }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        })
        .end(buffer);
    });

    const imagenUrl = (response as { secure_url: string }).secure_url;

    // Crea el evento con la URL de imagen correcta
    const evento = new Evento({
      nombre,
      timestamp,
      lugar,
      lat: 0,
      lon: 0,
      organizador,
      imagen: imagenUrl,
    });

    await evento.save();
    return NextResponse.json(evento, { status: 201 });
  } catch (error) {
    console.error("Error al crear el evento:", error);
    return NextResponse.json(
      { error: "Error al crear el evento" },
      { status: 500 }
    );
  }
}
