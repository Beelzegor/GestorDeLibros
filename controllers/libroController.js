const Libro = require('../models/Libro');
const { ESTADOS_LECTURA } = require('../models/Libro');

const validarCamposComunes = ({ calificacion, estadoLectura }) => {
  if (calificacion !== undefined) {
    const numero = Number(calificacion);
    if (Number.isNaN(numero) || numero < 0 || numero > 5) {
      return 'La calificacion debe ser un numero entre 0 y 5';
    }
  }

  if (estadoLectura !== undefined && !ESTADOS_LECTURA.includes(estadoLectura)) {
    return `estadoLectura debe ser uno de: ${ESTADOS_LECTURA.join(', ')}`;
  }

  return null;
};

const crearLibro = async (req, res) => {
  try {
    const { titulo, autor, genero, estadoLectura, calificacion } = req.body;

    if (!titulo || !autor || !genero) {
      return res.status(400).json({
        error: 'Los campos titulo, autor y genero son obligatorios',
      });
    }

    const errorValidacion = validarCamposComunes({ calificacion, estadoLectura });
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    const nuevoLibro = await Libro.create({
      titulo,
      autor,
      genero,
      estadoLectura,
      calificacion,
    });

    return res.status(201).json(nuevoLibro);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const actualizarLibro = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, autor, genero, estadoLectura, calificacion } = req.body;

    const errorValidacion = validarCamposComunes({ calificacion, estadoLectura });
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    const camposActualizados = {};
    if (titulo !== undefined) camposActualizados.titulo = titulo;
    if (autor !== undefined) camposActualizados.autor = autor;
    if (genero !== undefined) camposActualizados.genero = genero;
    if (estadoLectura !== undefined) camposActualizados.estadoLectura = estadoLectura;
    if (calificacion !== undefined) camposActualizados.calificacion = calificacion;

    const libroActualizado = await Libro.findByIdAndUpdate(id, camposActualizados, {
      new: true,
      runValidators: true,
      context: 'query',
    });

    if (!libroActualizado) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    return res.status(200).json(libroActualizado);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'El id proporcionado no es valido' });
    }
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  crearLibro,
  actualizarLibro,
};
