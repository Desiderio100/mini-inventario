const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'inventario',
};

async function getConnection() {
  return mysql.createConnection(dbConfig);
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mini-inventario-api' });
});

// GET /productos - RESUELTO
app.get('/productos', async (req, res) => {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute('SELECT * FROM productos');
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /productos/:id - añadido
app.get('/productos/:id', async (req, res) => {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    await conn.end();
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /productos - RESUELTO
app.post('/productos', async (req, res) => {
  const { nombre, cantidad, precio } = req.body;
  if (!nombre || !cantidad || !precio) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  try {
    const conn = await getConnection();
    const [result] = await conn.execute(
      'INSERT INTO productos (nombre, cantidad, precio) VALUES (?, ?, ?)',
      [nombre, cantidad, precio]
    );
    await conn.end();
    res.status(201).json({ id: result.insertId, nombre, cantidad, precio });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /productos/:id/stock - añadido
app.put('/productos/:id/stock', async (req, res) => {
  const { cantidad } = req.body;
  try {
    const conn = await getConnection();
    const [result] = await conn.execute('UPDATE productos SET cantidad = ? WHERE id = ?', [cantidad, req.params.id]);
    await conn.end();
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ mensaje: 'Stock actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /productos/:id - añadido
app.delete('/productos/:id', async (req, res) => {
  try {
    const conn = await getConnection();
    const [result] = await conn.execute('DELETE FROM productos WHERE id = ?', [req.params.id]);
    await conn.end();
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API corriendo en puerto ${PORT}`);
});
