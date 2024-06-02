const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Configurar middleware
app.use(bodyParser.json());

// Configurar la conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'notasdb',
  password: 'password',
  port: 5432,
});

// Crear tablas si no existen
pool.query(`
  CREATE TABLE IF NOT EXISTS notas (
    id SERIAL PRIMARY KEY,
    estudiante VARCHAR(50),
    calificacion INTEGER
  )
`);

// Rutas de la API

// Crear una nota
app.post('/notas', async (req, res) => {
  const { estudiante, calificacion } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO notas (estudiante, calificacion) VALUES ($1, $2) RETURNING *',
      [estudiante, calificacion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leer una nota específica
app.get('/notas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM notas WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Nota no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar una nota
app.put('/notas/:id', async (req, res) => {
  const { id } = req.params;
  const { estudiante, calificacion } = req.body;
  try {
    const result = await pool.query(
      'UPDATE notas SET estudiante = $1, calificacion = $2 WHERE id = $3 RETURNING *',
      [estudiante, calificacion, id]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Nota no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Borrar una nota
app.delete('/notas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM notas WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Nota no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
