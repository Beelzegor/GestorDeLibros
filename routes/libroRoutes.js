const express = require('express');
const { crearLibro, actualizarLibro } = require('../controllers/libroController');

const router = express.Router();

router.post('/', crearLibro);
router.put('/:id', actualizarLibro);
router.patch('/:id', actualizarLibro);

module.exports = router;

const {
  crearLibro,
  actualizarLibro,
  listarLibros,
  obtenerLibroPorId,
  eliminarLibro,
} = require('../controllers/libroController');

router.get('/', listarLibros);
router.get('/:id', obtenerLibroPorId);
router.delete('/:id', eliminarLibro);
router.get('/estadisticas/resumen', obtenerEstadisticas);
