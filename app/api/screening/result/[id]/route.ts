import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/database"
import { verifyUserToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let connection;
  
  try {
    // Unwrap params
    const { id } = await params
    
    const authResult = await verifyUserToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    connection = await connectDB()

    // Get screening result with disease and treatment details
    const [resultRows] = await connection.execute(
      `
      SELECT 
        sr.id, 
        sr.screening_date, 
        sr.result_disease_code, 
        sr.confidence_level,
        sr.notes,
        d.name as disease_name,
        d.description as disease_description
      FROM 
        screening_results sr
      LEFT JOIN 
        diseases d ON sr.result_disease_code = d.code
      WHERE 
        sr.id = ? AND sr.user_id = ?
    `,
      [id, authResult.user.userId],
    )

    const results = resultRows as any[]

    if (results.length === 0) {
      return NextResponse.json({ error: "Screening result not found" }, { status: 404 })
    }

    const result = results[0]

    // Get treatments for this disease
    const [treatmentRows] = await connection.execute(
      `
      SELECT 
        id, 
        treatment_name, 
        description, 
        priority_order
      FROM 
        treatments 
      WHERE 
        disease_code = ? AND is_active = TRUE
      ORDER BY 
        priority_order ASC
    `,
      [result.result_disease_code],
    )

    await connection.end()

    return NextResponse.json({
      result: {
        ...result,
        treatments: treatmentRows,
      },
    })
  } catch (error) {
    console.error("Get screening result error:", error)
    if (connection) {
      await connection.end()
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}