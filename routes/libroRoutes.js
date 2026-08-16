const express = require('express');
const { crearLibro, actualizarLibro } = require('../controllers/libroController');

const router = express.Router();

router.post('/', crearLibro);
router.put('/:id', actualizarLibro);
router.patch('/:id', actualizarLibro);

// GET y DELETE los agrega otro miembro del equipo en este mismo archivo

module.exports = router;
