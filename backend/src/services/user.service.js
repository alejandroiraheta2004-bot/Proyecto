import pool from '../config/database.js';
import bcrypt from 'bcrypt';

export const userExists = async ( email ) => {
  const normalizedEmail = (email || '').trim().toLowerCase();
  // Busca usuario por correo para validar duplicados
  const [rows] = await pool.query(
    `SELECT id FROM users WHERE LOWER(email) = ?`,
    [normalizedEmail]
  );
    
  return rows[0];
}

export const usernameExists = async (username) => {
  const value = (username || '').trim();
  const [rows] = await pool.query(
    'SELECT id FROM users WHERE username = ? LIMIT 1',
    [value]
  );
  return rows[0];
};

export const verifyPassword = async (email, password) => {
  const normalizedEmail = (email || '').trim().toLowerCase();
  // Recupera usuario y compara contraseña
  const [rows] = await pool.query(
    `SELECT u.*, r.descripcion AS rol
     FROM users u
     LEFT JOIN rols r ON r.id = u.id_rol
     WHERE LOWER(u.email) = ?`,
    [normalizedEmail]
  );

  const user = rows[0];
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.nombre,
    rol: user.rol || 'cliente',
    estado: user.estado,
    saldo_actual: user.saldo_actual,
    account_number: user.account_number,
    username: user.username
  };
}

export const accountNumberExists = async (accountNumber) => {
  const [rows] = await pool.query(
    'SELECT id FROM users WHERE account_number = ? LIMIT 1',
    [accountNumber]
  );
  return rows[0];
};

export const generateUniqueAccountNumber = async () => {
  const MAX_TRIES = 10;
  for (let i = 0; i < MAX_TRIES; i += 1) {
    const accountNumber = `10${Math.floor(Math.random() * 1e10).toString().padStart(10, '0')}`;
    const exists = await accountNumberExists(accountNumber);
    if (!exists) return accountNumber;
  }
  throw new Error('No se pudo generar un número de cuenta único');
};

export const findUserByUsernameOrAccount = async (identifier) => {
  const value = (identifier || '').trim();
  if (!value) return null;
  const [rows] = await pool.query(
    `SELECT id, nombre, username, account_number, saldo_actual, estado
     FROM users
     WHERE username = ? OR account_number = ?
     LIMIT 1`,
    [value, value]
  );
  return rows[0];
};

export const verifyUserExistsById = async ( id ) => {
  // Verifica existencia de usuario por id
  const user = await pool.query(`
    SELECT * FROM users WHERE id = "${id};"  
  `)
  console.log('verify user exist by id - user services js', user);
  return user;
}

export const verifyRolExistById = async ( id ) => {
  // Devuelve el rol asignado a un usuario
  const [rows] = await pool.query(`
    SELECT * FROM users WHERE id = "${id}";  
  `);

  console.log('verify rol exist by rol - user services js', rol);
  return rows[0].id_rol;
}

export const doesTheUserHaveSubmittedRol = async ( rol, user_id ) => {
  // Comprueba si el rol enviado coincide con el rol real del usuario
  const [userRows] = await pool.query(`
    SELECT * FROM users WHERE id = "${user_id}";  
  `);

  const [rolRows] =  await pool.query (`
    SELECT * FROM rols WHERE descripcion = "${rol}";  
  `);


  // if the user exists and the rol exists then we make the comparison
  // otherwise, we throw an error
  
  return (rolRows[0] && userRows[0]) ? (rolRows[0].id === userRows[0].id_rol) : false;
  
}