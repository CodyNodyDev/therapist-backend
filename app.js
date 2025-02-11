require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM users WHERE userid = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

app.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { level, balans, gender } = req.body;

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE userid = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const updatedUser = {
      level: level || existingUser.rows[0].level,
      balans: balans || existingUser.rows[0].balans,
      gender: gender || existingUser.rows[0].gender
    };

    await pool.query(
      'UPDATE users SET level = $1, balans = $2, gender = $3 WHERE userid = $4',
      [updatedUser.level, updatedUser.balans, updatedUser.gender, id]
    );

    res.json({ message: 'Пользователь обновлен', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
