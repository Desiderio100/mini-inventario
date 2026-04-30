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

// GET /productos
app.get('/productos', async (req, res) => {
  const connection = await getConnection();
  const [rows] = await connection.execute('SELECT * FROM productos');
  await connection.end();
  res.json(rows);
});

// GET /productos/:id
app.get('/productos/:id', async (req, res) => {
  const connection = await getConnection();
  const [rows] = await connection.execute('SELECT * FROM productos WHERE id = ?', [req.params.id]);
  await connection.end();
  if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(rows[0]);
});

// POST /productos
app.post('/productos', async (req, res) => {
  const { nombre, cantidad, precio, descripcion } = req.body;
  if (!nombre || cantidad === undefined || precio === undefined) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  const connection = await getConnection();
  const [result] = await connection.execute(
    'INSERT INTO productos (nombre, descripcion, cantidad, precio) VALUES (?, ?, ?, ?)',
    [nombre, descripcion || '', cantidad, precio]
  );
  await connection.end();
  res.status(201).json({ id: result.insertId, nombre, cantidad, precio });
});

// PUT /productos/:id/stock
app.put('/productos/:id/stock', async (req, res) => {
  const { cantidad } = req.body;
  const connection = await getConnection();
  const [result] = await connection.execute('UPDATE productos SET cantidad = ? WHERE id = ?', [cantidad, req.params.id]);
  await connection.end();
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ mensaje: 'Stock actualizado' });
});

// DELETE /productos/:id
app.delete('/productos/:id', async (req, res) => {
  const connection = await getConnection();
  const [result] = await connection.execute('DELETE FROM productos WHERE id = ?', [req.params.id]);
  await connection.end();
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ mensaje: 'Producto eliminado' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));
