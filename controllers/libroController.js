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

const listarLibros = async (req, res) => {
  try {
    const { genero, estadoLectura } = req.query;
    const filtro = {};

    if (genero) filtro.genero = genero;
    if (estadoLectura) filtro.estadoLectura = estadoLectura;

    const libros = await Libro.find(filtro);
    res.status(200).json(libros);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los libros', error: error.message });
  }
};

const obtenerLibroPorId = async (req, res) => {
  try {
    const libro = await Libro.findById(req.params.id);

    if (!libro) {
      return res.status(404).json({ mensaje: 'Libro no encontrado' });
    }

    res.status(200).json(libro);
  } catch (error) {
    res.status(400).json({ mensaje: 'ID inválido', error: error.message });
  }
};

const eliminarLibro = async (req, res) => {
  try {
    const libro = await Libro.findByIdAndDelete(req.params.id);

    if (!libro) {
      return res.status(404).json({ mensaje: 'Libro no encontrado' });
    }

    res.status(200).json({ mensaje: 'Libro eliminado correctamente' });
  } catch (error) {
    res.status(400).json({ mensaje: 'ID inválido', error: error.message });
  }
};

module.exports.listarLibros = listarLibros;
module.exports.obtenerLibroPorId = obtenerLibroPorId;
module.exports.eliminarLibro = eliminarLibro;

const obtenerEstadisticas = async (req, res) => {
  try {
    const total = await Libro.countDocuments();
    const porEstado = await Libro.aggregate([
      { $group: { _id: '$estadoLectura', cantidad: { $sum: 1 } } }
    ]);
    const promedioCalificacion = await Libro.aggregate([
      { $match: { calificacion: { $ne: null } } },
      { $group: { _id: null, promedio: { $avg: '$calificacion' } } }
    ]);

    res.status(200).json({
      totalLibros: total,
      porEstado,
      promedioCalificacion: promedioCalificacion[0]?.promedio || 0,
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener estadísticas', error: error.message });
  }
};

module.exports.obtenerEstadisticas = obtenerEstadisticas;