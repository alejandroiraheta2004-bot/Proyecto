import bcrypt from 'bcrypt';
import pool from '../../config/database.js';
import 'dotenv/config';

async function run() {
  const adminEmail = 'admin@ewallet.com';
  const adminPass = 'Admin123!';
  const adminHash = '$2b$10$c41cPLLZJUATKwIWGTtlTuurJu4yPUqLaSusEpqE/MlKL0UZJF0xG';

  console.log('Seeding roles y admin...');

  // Crea roles base si no existen
  await pool.query(`INSERT IGNORE INTO rols (id, descripcion) VALUES (1,'admin'),(2,'cliente');`);

  // Inserta usuario admin por defecto
  const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [adminEmail]);
  if (rows.length === 0) {
    await pool.query(
      `INSERT INTO users (id_rol, nombre, username, email, telefono, password, saldo_actual, estado)
       VALUES (1, 'Administrador', 'admin', ?, '00000000', ?, 0, 1);`,
      [adminEmail, adminHash]
    );
    console.log('Usuario admin creado: admin@ewallet.com / Admin123!');
  } else {
    console.log('Usuario admin ya existe, no se creó otro.');
  }

  // Verificar conexión y salida
  const [rols] = await pool.query('SELECT * FROM rols');
  console.log('Roles:', rols);

  process.exit(0);
}

run().catch((err) => {
  console.error('Error al sembrar datos:', err.message);
  process.exit(1);
});
