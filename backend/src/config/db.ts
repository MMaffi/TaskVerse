import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.getConnection()
  .then(connection => {
    console.log('✅ Conectado ao MySQL');
    connection.release();
  })
  .catch(error => {
    console.error('❌ Erro de conexão:', error.message);
  });