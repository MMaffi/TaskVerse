import mysql, { Pool } from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

export default pool;

pool.getConnection()
  .then(connection => {
    console.log('✅ Conectado ao MySQL');
    connection.release();
  })
  .catch(error => {
    console.error('❌ Erro de conexão:', error.message);
  });