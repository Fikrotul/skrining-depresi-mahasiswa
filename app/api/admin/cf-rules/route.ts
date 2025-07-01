import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/database"
import { verifyAdminToken } from "@/lib/auth"

// POST - Menambah CF rule baru
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { symptomCode, diseaseCode, cfExpert } = await request.json()

    if (!symptomCode || !diseaseCode) {
      return NextResponse.json({ error: "Kode gejala dan kode penyakit wajib diisi" }, { status: 400 })
    }

    if (cfExpert === undefined || cfExpert === null || isNaN(cfExpert) || cfExpert < 0 || cfExpert > 1) {
      return NextResponse.json({ error: "Nilai CF harus berupa angka antara 0 dan 1" }, { status: 400 })
    }

    const connection = await connectDB()

    // Cek apakah gejala ada dan aktif
    const [symptomRows] = await connection.execute(
      "SELECT id, name FROM symptoms WHERE code = ? AND is_active = TRUE",
      [symptomCode],
    )

    if ((symptomRows as any[]).length === 0) {
      await connection.end()
      return NextResponse.json({ error: "Gejala tidak ditemukan atau tidak aktif" }, { status: 404 })
    }

    // Cek apakah CF rule sudah ada
    const [existingRules] = await connection.execute(
      "SELECT id, is_active FROM cf_rules WHERE symptom_code = ? AND disease_code = ?",
      [symptomCode, diseaseCode],
    )

    if ((existingRules as any[]).length > 0) {
      const existingRule = (existingRules as any[])[0]

      if (existingRule.is_active) {
        // Update CF rule yang sudah ada
        await connection.execute("UPDATE cf_rules SET cf_expert = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
          cfExpert,
          existingRule.id,
        ])

        await connection.end()
        return NextResponse.json({
          message: "Nilai CF berhasil diperbarui",
          id: existingRule.id,
        })
      } else {
        // Reaktivasi CF rule yang tidak aktif
        await connection.execute(
          "UPDATE cf_rules SET cf_expert = ?, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [cfExpert, existingRule.id],
        )

        await connection.end()
        return NextResponse.json({
          message: "Nilai CF berhasil diaktifkan kembali",
          id: existingRule.id,
        })
      }
    }

    // Buat CF rule baru
    const [result] = await connection.execute(
      "INSERT INTO cf_rules (symptom_code, disease_code, cf_expert) VALUES (?, ?, ?)",
      [symptomCode, diseaseCode, cfExpert],
    )

    await connection.end()

    return NextResponse.json({
      message: "Nilai CF berhasil ditambahkan",
      id: (result as any).insertId,
    })
  } catch (error) {
    console.error("Error menambah CF rule:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}

// PUT - Memperbarui CF rule
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { id, symptomCode, diseaseCode, cfExpert, code, name, description } = await request.json()

    // Jika ini adalah update untuk nama gejala
    if (code) {
      const connection = await connectDB()

      // Update nama gejala
      await connection.execute(
        "UPDATE symptoms SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE code = ?",
        [name, description || null, code],
      )

      await connection.end()
      return NextResponse.json({ message: "Data gejala berhasil diperbarui" })
    }

    // Jika ini adalah update untuk CF rule
    if (!id && (!symptomCode || !diseaseCode)) {
      return NextResponse.json({ error: "ID atau kode gejala dan kode penyakit wajib diisi" }, { status: 400 })
    }

    if (cfExpert === undefined || cfExpert === null || isNaN(cfExpert) || cfExpert < 0 || cfExpert > 1) {
      return NextResponse.json({ error: "Nilai CF harus berupa angka antara 0 dan 1" }, { status: 400 })
    }

    const connection = await connectDB()

    let query, params
    if (id) {
      query = "UPDATE cf_rules SET cf_expert = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      params = [cfExpert, id]
    } else {
      query =
        "UPDATE cf_rules SET cf_expert = ?, updated_at = CURRENT_TIMESTAMP WHERE symptom_code = ? AND disease_code = ? AND is_active = TRUE"
      params = [cfExpert, symptomCode, diseaseCode]
    }

    const [result] = await connection.execute(query, params)

    await connection.end()

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "CF rule tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ message: "Nilai CF berhasil diperbarui" })
  } catch (error) {
    console.error("Error memperbarui CF rule:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}

// DELETE - Menghapus CF rule (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID CF rule wajib diisi" }, { status: 400 })
    }

    const connection = await connectDB()

    // Soft delete CF rule
    const [result] = await connection.execute(
      "UPDATE cf_rules SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_active = TRUE",
      [id],
    )

    await connection.end()

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "CF rule tidak ditemukan atau sudah dihapus" }, { status: 404 })
    }

    return NextResponse.json({ message: "Nilai CF berhasil dihapus" })
  } catch (error) {
    console.error("Error menghapus CF rule:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}

// GET - Mengambil semua CF rules
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const connection = await connectDB()

    const [rows] = await connection.execute(`
      SELECT 
        cf.id,
        cf.symptom_code,
        cf.disease_code,
        cf.cf_expert,
        s.name as symptom_name,
        s.description as symptom_description,
        CASE 
          WHEN cf.disease_code = 'P01' THEN 'Depresi Ringan'
          WHEN cf.disease_code = 'P02' THEN 'Depresi Sedang'
          WHEN cf.disease_code = 'P03' THEN 'Depresi Berat'
          ELSE cf.disease_code
        END as disease_name
      FROM cf_rules cf
      LEFT JOIN symptoms s ON cf.symptom_code = s.code
      WHERE cf.is_active = TRUE
      ORDER BY cf.symptom_code, cf.disease_code
    `)

    await connection.end()

    return NextResponse.json({ cfRules: rows })
  } catch (error) {
    console.error("Error mengambil data CF rules:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
