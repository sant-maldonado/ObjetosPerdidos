const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3001;

const db = new Database(path.join(__dirname, 'findit.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS objetos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    categoria TEXT,
    estado TEXT NOT NULL CHECK(estado IN ('perdido', 'encontrado')),
    fecha TEXT,
    contacto TEXT,
    imagen TEXT,
    ubicacion TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(cors());
app.use(express.json());

app.get('/api/objetos', (req, res) => {
  const { busqueda, categoria, estado } = req.query;
  
  let sql = 'SELECT * FROM objetos WHERE 1=1';
  const params = [];
  
  if (busqueda) {
    sql += ' AND (titulo LIKE ? OR descripcion LIKE ?)';
    params.push(`%${busqueda}%`, `%${busqueda}%`);
  }
  if (categoria) {
    sql += ' AND categoria = ?';
    params.push(categoria);
  }
  if (estado) {
    sql += ' AND estado = ?';
    params.push(estado);
  }
  
  sql += ' ORDER BY creado_en DESC';
  
  const stmt = db.prepare(sql);
  const objetos = stmt.all(...params);
  res.json(objetos);
});

app.get('/api/objetos/:id', (req, res) => {
  const stmt = db.prepare('SELECT * FROM objetos WHERE id = ?');
  const objeto = stmt.get(req.params.id);
  
  if (!objeto) {
    return res.status(404).json({ error: 'Objeto no encontrado' });
  }
  res.json(objeto);
});

app.post('/api/objetos', (req, res) => {
  const { titulo, descripcion, categoria, estado, fecha, contacto, imagen, ubicacion } = req.body;
  
  if (!titulo || !estado) {
    return res.status(400).json({ error: 'Título y estado son requeridos' });
  }
  
  const stmt = db.prepare(`
    INSERT INTO objetos (titulo, descripcion, categoria, estado, fecha, contacto, imagen, ubicacion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(titulo, descripcion || '', categoria || '', estado, fecha || '', contacto || '', imagen || '', ubicacion || '');
  
  res.json({ id: result.lastInsertRowid, message: 'Objeto creado' });
});

app.put('/api/objetos/:id', (req, res) => {
  const { titulo, descripcion, categoria, estado, fecha, contacto, imagen, ubicacion } = req.body;
  
  const stmt = db.prepare(`
    UPDATE objetos 
    SET titulo = COALESCE(?, titulo),
        descripcion = COALESCE(?, descripcion),
        categoria = COALESCE(?, categoria),
        estado = COALESCE(?, estado),
        fecha = COALESCE(?, fecha),
        contacto = COALESCE(?, contacto),
        imagen = COALESCE(?, imagen),
        ubicacion = COALESCE(?, ubicacion)
    WHERE id = ?
  `);
  
  const result = stmt.run(titulo, descripcion, categoria, estado, fecha, contacto, imagen, ubicacion, req.params.id);
  
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Objeto no encontrado' });
  }
  res.json({ message: 'Objeto actualizado' });
});

app.delete('/api/objetos/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM objetos WHERE id = ?');
  const result = stmt.run(req.params.id);
  
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Objeto no encontrado' });
  }
  res.json({ message: 'Objeto eliminado' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});