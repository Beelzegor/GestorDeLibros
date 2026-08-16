require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const libroRoutes = require('./routes/libroRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/libros', libroRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
