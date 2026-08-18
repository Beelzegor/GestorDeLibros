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

router.get('/estadisticas/resumen', obtenerEstadisticas); 

// Rutas base
router.get('/', listarLibros);
router.post('/', crearLibro);

router.get('/:id', obtenerLibroPorId);
router.put('/:id', actualizarLibro);
router.patch('/:id', actualizarLibro);
router.delete('/:id', eliminarLibro);

module.exports = router;