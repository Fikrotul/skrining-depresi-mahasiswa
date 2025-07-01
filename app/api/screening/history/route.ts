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

    // Get user's screening history with disease names
    const [rows] = await connection.execute(
      `
      SELECT 
        sr.id, 
        sr.screening_date, 
        sr.result_disease_code, 
        sr.confidence_level,
        d.name as disease_name
      FROM 
        screening_results sr
      LEFT JOIN 
        diseases d ON sr.result_disease_code = d.code
      WHERE 
        sr.user_id = ?
      ORDER BY 
        sr.screening_date DESC
    `,
      [authResult.user.userId],
    )

    await connection.end()

    return NextResponse.json({ results: rows })
  } catch (error) {
    console.error("Get screening history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
