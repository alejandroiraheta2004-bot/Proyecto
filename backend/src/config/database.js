import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = process.env.DATABASE_URL
	? mysql.createPool(process.env.DATABASE_URL)
	: mysql.createPool({
			host: process.env.DB_HOST || '${{RAILWAY_PRIVATE_DOMAIN}}',
			user: process.env.DB_USER || 'root',
			password: process.env.DB_PASSWORD || '${{MYSQL_ROOT_PASSWORD}}',
			database: process.env.DB_NAME || 'railway',
			waitForConnections: true,
			connectionLimit: 10
		});
export default pool;