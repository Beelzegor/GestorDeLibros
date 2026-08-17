const express = require('express');
const {
  crearLibro,
  actualizarLibro,
  listarLibros,
  obtenerLibroPorId,
  eliminarLibro,
  obtenerEstadisticas,
} = require('../controllers/libroController');

const router = express.Router();

router.get('/', listarLibros);
router.get('/:id', obtenerLibroPorId);
router.post('/', crearLibro);
router.put('/:id', actualizarLibro);
router.patch('/:id', actualizarLibro);
router.delete('/:id', eliminarLibro);
router.get('/estadisticas/resumen', obtenerEstadisticas);

module.exports = router;
