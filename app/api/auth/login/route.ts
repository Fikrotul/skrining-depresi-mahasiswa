import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/database"

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { email, password, userType } = await request.json()

    console.log("Login attempt:", { email, userType }) // Debug log

    if (!email || !password || !userType) {
      return NextResponse.json({ error: "Email, password, and user type are required" }, { status: 400 })
    }

    connection = await connectDB()

    // Determine table based on user type
    const table = userType === "admin" ? "admin_users" : "users"

    // Find user
    const [rows] = await connection.execute(`SELECT * FROM ${table} WHERE email = ?`, [email])

    const users = rows as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: "Gagal Masuk. User tidak tersedia.." }, { status: 401 })
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Gagal Masuk. Password Salah.." }, { status: 401 })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        userType,
        fullName: user.full_name,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    )

    console.log("Login successful for:", email) // Debug log

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        userType,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
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