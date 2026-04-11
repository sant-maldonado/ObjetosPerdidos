require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.query('SELECT NOW()')
  .then(() => console.log('PostgreSQL connected'))
  .catch(err => console.error('PostgreSQL connection error:', err));

app.use(cors());
app.use(express.json());

app.get('/api/objetos', async (req, res) => {
  const { busqueda, categoria, estado } = req.query;
  
  let sql = 'SELECT * FROM objetos WHERE 1=1';
  const params = [];
  const conditions = [];

  if (busqueda) {
    params.push(`%${busqueda}%`);
    conditions.push(`(titulo ILIKE $${params.length} OR descripcion ILIKE $${params.length})`);
  }
  if (categoria) {
    params.push(categoria);
    conditions.push(`categoria = $${params.length}`);
  }
  if (estado) {
    params.push(estado);
    conditions.push(`estado = $${params.length}`);
  }

  if (conditions.length > 0) {
    sql += ' AND ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY creado_en DESC';
  
  try {
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/objetos/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM objetos WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Objeto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/objetos', async (req, res) => {
  const { titulo, descripcion, categoria, estado, fecha, contacto, imagen, ubicacion } = req.body;
  
  if (!titulo || !estado) {
    return res.status(400).json({ error: 'Título y estado son requeridos' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO objetos (titulo, descripcion, categoria, estado, fecha, contacto, imagen, ubicacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [titulo, descripcion, categoria, estado, fecha, contacto, imagen, ubicacion]
    );

    res.json({ id: result.rows[0].id, message: 'Objeto creado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/objetos/:id', async (req, res) => {
  const { titulo, descripcion, categoria, estado, fecha, contacto, imagen, ubicacion } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE objetos SET titulo = COALESCE($1, titulo), descripcion = COALESCE($2, descripcion),
       categoria = COALESCE($3, categoria), estado = COALESCE($4, estado), fecha = COALESCE($5, fecha),
       contacto = COALESCE($6, contacto), imagen = COALESCE($7, imagen), ubicacion = COALESCE($8, ubicacion)
       WHERE id = $9`,
      [titulo, descripcion, categoria, estado, fecha, contacto, imagen, ubicacion, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Objeto no encontrado' });
    }
    res.json({ message: 'Objeto actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/objetos/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM objetos WHERE id = $1', [req.params.id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Objeto no encontrado' });
    }
    res.json({ message: 'Objeto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});