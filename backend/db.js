const mysql = require("mysql2");

const {
  DATABASE_URL,
  DB_HOST = "localhost",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "satellite_tracker",
  DB_SSL = "false"
} = process.env;

const useSsl = DB_SSL === "true";

const db = DATABASE_URL
  ? mysql.createPool(DATABASE_URL)
  : mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      ssl: useSsl ? { rejectUnauthorized: true } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

function checkConnection() {
  db.getConnection((err, connection) => {
    if (err) {
      console.error("DB connection failed:", err.message);
      return;
    }

    console.log("Database pool connected");
    connection.release();
  });
}

module.exports = { db, checkConnection };