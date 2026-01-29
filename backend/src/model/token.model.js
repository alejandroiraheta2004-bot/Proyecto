import pool from "../config/database.js";

export const saveToken = async (userId, token) => {
  // Guarda token activo asociado al usuario
  const [result] = await pool.query('INSERT INTO active_tokens (user_id, token) VALUES (?, ?)', [userId, token]);
  console.log("result", result);
  return result;
};

export const isTokenActive = async (token) => {
  // Verifica si el token está registrado como activo
  const [rows] = await pool.query('SELECT * FROM active_tokens WHERE token = ?', [token]);
  return rows[0] || null;
};

export const deleteToken = async (token) => {
  // Elimina token al cerrar sesión
  const [result] = await pool.query('DELETE FROM active_tokens WHERE token = ?', [token]);
  return result || null;
}