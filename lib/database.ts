import mysql from "mysql2/promise"

export async function connectDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root", 
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "depression_screening_db1",
      port: Number.parseInt(process.env.DB_PORT || "3306"),
      // Tambahkan opsi ini untuk mengatasi masalah koneksi
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
    })

    // Test koneksi
    await connection.ping()
    console.log("Database connected successfully")
    
    return connection
  } catch (error) {
    console.error("Database connection error:", error)
    throw new Error(`Failed to connect to database: ${error.message}`)
  }
}