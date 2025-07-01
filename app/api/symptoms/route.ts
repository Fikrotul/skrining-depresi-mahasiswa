import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/database"
import { verifyUserToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyUserToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const connection = await connectDB()

    const [rows] = await connection.execute("SELECT * FROM symptoms WHERE is_active = TRUE ORDER BY code")

    await connection.end()

    return NextResponse.json({ symptoms: rows })
  } catch (error) {
    console.error("Get symptoms error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
