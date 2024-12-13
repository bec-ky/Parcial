import mongoose from "mongoose";

const EventoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    lugar: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
    organizador: {
      type: String,
      required: true,
    },
    imagen: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Evento =
  mongoose.models?.Evento || mongoose.model("Evento", EventoSchema);

export default Evento;