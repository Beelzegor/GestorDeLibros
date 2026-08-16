const mongoose = require('mongoose');

const ESTADOS_LECTURA = ['pendiente', 'leyendo', 'terminado'];

const libroSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El titulo es obligatorio'],
      trim: true,
    },
    autor: {
      type: String,
      required: [true, 'El autor es obligatorio'],
      trim: true,
    },
    genero: {
      type: String,
      required: [true, 'El genero es obligatorio'],
      trim: true,
    },
    estadoLectura: {
      type: String,
      enum: {
        values: ESTADOS_LECTURA,
        message: `estadoLectura debe ser uno de: ${ESTADOS_LECTURA.join(', ')}`,
      },
      default: 'pendiente',
    },
    calificacion: {
      type: Number,
      min: [0, 'La calificacion no puede ser menor a 0'],
      max: [5, 'La calificacion no puede ser mayor a 5'],
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Libro', libroSchema);
module.exports.ESTADOS_LECTURA = ESTADOS_LECTURA;
