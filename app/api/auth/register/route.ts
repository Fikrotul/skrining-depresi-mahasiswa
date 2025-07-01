import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/database"

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { username, email, password, fullName, dateOfBirth, gender, phone } = await request.json()

    console.log("Registration attempt:", { username, email, fullName }) // Debug log

    if (!username || !email || !password || !fullName) {
      return NextResponse.json({ error: "Username, email, password, and full name are required" }, { status: 400 })
    }

    connection = await connectDB()

    // Check if user already exists
    const [existingUsers] = await connection.execute("SELECT id FROM users WHERE email = ? OR username = ?", [
      email,
      username,
    ])

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json({ error: "User with this email or username already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Insert new user
    const [result] = await connection.execute(
      `INSERT INTO users (username, email, password, full_name, date_of_birth, gender, phone) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, fullName, dateOfBirth || null, gender || null, phone || null],
    )

    console.log("User created successfully:", (result as any).insertId) // Debug log

    return NextResponse.json({
      message: "User registered successfully",
      userId: (result as any).insertId,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message // Tambahkan detail error untuk debugging
    }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}