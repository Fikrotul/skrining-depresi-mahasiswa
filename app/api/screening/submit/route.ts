import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/database"
import { verifyUserToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyUserToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { answers, sessionId } = await request.json()

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ error: "Screening answers are required" }, { status: 400 })
    }

    const connection = await connectDB()

    // Get CF rules
    const [cfRules] = await connection.execute("SELECT * FROM cf_rules WHERE is_active = TRUE")

    // Calculate CF for each disease
    const diseasesCF: { [key: string]: number } = {}

    for (const rule of cfRules as any[]) {
      const symptomCode = rule.symptom_code
      if (answers[symptomCode] && Number.parseFloat(answers[symptomCode]) > 0) {
        const cfUser = Number.parseFloat(answers[symptomCode])
        const cfExpert = rule.cf_expert
        const cf = cfUser * cfExpert
        const diseaseCode = rule.disease_code

        if (!(diseaseCode in diseasesCF)) {
          diseasesCF[diseaseCode] = cf
        } else {
          // CF combination formula
          diseasesCF[diseaseCode] = diseasesCF[diseaseCode] + cf * (1 - diseasesCF[diseaseCode])
        }
      }
    }

    if (Object.keys(diseasesCF).length === 0) {
      await connection.end()
      return NextResponse.json({ error: "No symptoms detected" }, { status: 400 })
    }

    // Find highest CF
    const finalResult = Object.entries(diseasesCF).reduce((max, current) => (current[1] > max[1] ? current : max))

    const [resultDiseaseCode, confidenceLevel] = finalResult

    // Get disease details
    const [diseaseRows] = await connection.execute("SELECT * FROM diseases WHERE code = ?", [resultDiseaseCode])

    const disease = (diseaseRows as any[])[0]

    // Get treatments
    const [treatmentRows] = await connection.execute(
      "SELECT * FROM treatments WHERE disease_code = ? AND is_active = TRUE ORDER BY priority_order",
      [resultDiseaseCode],
    )

    // Save screening result
    const [resultInsert] = await connection.execute(
      "INSERT INTO screening_results (user_id, session_id, result_disease_code, confidence_level) VALUES (?, ?, ?, ?)",
      [authResult.user.userId, sessionId || null, resultDiseaseCode, confidenceLevel],
    )

    const screeningResultId = (resultInsert as any).insertId

    // Save individual answers
    for (const [symptomCode, cfValue] of Object.entries(answers)) {
      if (Number.parseFloat(cfValue as string) > 0) {
        await connection.execute(
          "INSERT INTO screening_answers (screening_result_id, symptom_code, user_cf_value) VALUES (?, ?, ?)",
          [screeningResultId, symptomCode, cfValue],
        )
      }
    }

    await connection.end()

    return NextResponse.json({
      result: {
        diseaseCode: resultDiseaseCode,
        diseaseName: disease.name,
        confidenceLevel: Math.round(confidenceLevel * 100) / 100,
        treatments: treatmentRows,
        screeningId: screeningResultId,
      },
    })
  } catch (error) {
    console.error("Submit screening error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
