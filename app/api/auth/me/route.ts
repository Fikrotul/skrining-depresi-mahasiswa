import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

      const connection = await connectDB()

      // Get user details
      const table = decoded.userType === "admin" ? "admin_users" : "users"
      const [rows] = await connection.execute(`SELECT id, email, full_name FROM ${table} WHERE id = ?`, [
        decoded.userId,
      ])

      await connection.end()

      const users = rows as any[]

      if (users.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const user = users[0]

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          userType: decoded.userType,
        },
      })
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
