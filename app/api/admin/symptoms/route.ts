import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/database"
import { verifyAdminToken } from "@/lib/auth"

// Tambahkan fungsi helper untuk hard delete di bagian atas file setelah import statements
async function hardDeleteSymptom(connection: any, symptomId: number, symptomCode: string) {
  try {
    // Mulai transaction
    await connection.execute("START TRANSACTION")

    // 1. Hapus semua CF rules yang terkait dengan gejala ini
    await connection.execute("DELETE FROM cf_rules WHERE symptom_code = ?", [symptomCode])

    // 2. Hapus semua screening answers yang terkait dengan gejala ini
    await connection.execute("DELETE FROM screening_answers WHERE symptom_code = ?", [symptomCode])

    // 3. Hapus gejala itu sendiri
    await connection.execute("DELETE FROM symptoms WHERE id = ?", [symptomId])

    // Commit transaction
    await connection.execute("COMMIT")

    return { success: true }
  } catch (error) {
    // Rollback jika ada error
    await connection.execute("ROLLBACK")
    throw error
  }
}

// GET - Mengambil semua data gejala dengan CF rules
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const connection = await connectDB()

    // Ambil data gejala
    const [symptomsRows] = await connection.execute("SELECT * FROM symptoms WHERE is_active = TRUE ORDER BY code")

    // Ambil data CF rules untuk semua gejala
    const [cfRulesRows] = await connection.execute(`
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
      JOIN symptoms s ON cf.symptom_code = s.code
      WHERE cf.is_active = TRUE AND s.is_active = TRUE
      ORDER BY cf.symptom_code, cf.disease_code
    `)

    // Gabungkan data gejala dengan CF rules
    const symptomsWithCF = (symptomsRows as any[]).map((symptom) => {
      const cfRules = (cfRulesRows as any[]).filter((cf) => cf.symptom_code === symptom.code)

      // Hitung statistik CF
      const cfValues = cfRules.map((cf) => cf.cf_expert)
      const avgCF = cfValues.length > 0 ? cfValues.reduce((sum, val) => sum + val, 0) / cfValues.length : 0
      const maxCF = cfValues.length > 0 ? Math.max(...cfValues) : 0
      const minCF = cfValues.length > 0 ? Math.min(...cfValues) : 0

      return {
        ...symptom,
        cf_rules: cfRules,
        cf_statistics: {
          total_rules: cfRules.length,
          avg_cf: Number(avgCF.toFixed(3)),
          max_cf: maxCF,
          min_cf: minCF,
          has_cf: cfRules.length > 0,
        },
      }
    })

    await connection.end()

    return NextResponse.json({
      symptoms: symptomsWithCF,
      total_symptoms: symptomsWithCF.length,
      total_cf_rules: (cfRulesRows as any[]).length,
      symptoms_with_cf: symptomsWithCF.filter((s) => s.cf_statistics.has_cf).length,
      symptoms_without_cf: symptomsWithCF.filter((s) => !s.cf_statistics.has_cf).length,
    })
  } catch (error) {
    console.error("Error mengambil data gejala:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}

// POST - Menambah gejala baru
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { code, name, description } = await request.json()

    if (!code || !name) {
      return NextResponse.json({ error: "Kode dan nama gejala wajib diisi" }, { status: 400 })
    }

    const connection = await connectDB()

    // Cek apakah kode gejala sudah ada dan masih aktif
    const [existing] = await connection.execute("SELECT id, is_active FROM symptoms WHERE code = ?", [code])

    if ((existing as any[]).length > 0) {
      const existingSymptom = (existing as any[])[0]

      if (existingSymptom.is_active) {
        // Jika gejala masih aktif, tidak boleh menambah duplikat
        await connection.end()
        return NextResponse.json({ error: "Kode gejala sudah ada" }, { status: 409 })
      } else {
        // Jika gejala sudah tidak aktif (dihapus), reaktivasi dengan data baru
        const [result] = await connection.execute(
          "UPDATE symptoms SET name = ?, description = ?, is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE code = ?",
          [name, description || null, code],
        )

        await connection.end()

        return NextResponse.json({
          message: "Gejala berhasil ditambahkan",
          id: existingSymptom.id,
        })
      }
    }

    // Jika tidak ada duplikat, buat record baru
    const [result] = await connection.execute("INSERT INTO symptoms (code, name, description) VALUES (?, ?, ?)", [
      code,
      name,
      description || null,
    ])

    await connection.end()

    return NextResponse.json({
      message: "Gejala berhasil ditambahkan",
      id: (result as any).insertId,
    })
  } catch (error) {
    console.error("Error menambah gejala:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}

// PUT - Memperbarui data gejala
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { id, code, name, description } = await request.json()

    if (!id || !code || !name) {
      return NextResponse.json({ error: "ID, kode dan nama gejala wajib diisi" }, { status: 400 })
    }

    const connection = await connectDB()

    // Cek apakah kode gejala sudah ada (kecuali untuk record yang sedang diedit) dan masih aktif
    const [existing] = await connection.execute(
      "SELECT id FROM symptoms WHERE code = ? AND id != ? AND is_active = TRUE",
      [code, id],
    )

    if ((existing as any[]).length > 0) {
      await connection.end()
      return NextResponse.json({ error: "Kode gejala sudah ada" }, { status: 409 })
    }

    const [result] = await connection.execute("UPDATE symptoms SET code = ?, name = ?, description = ? WHERE id = ?", [
      code,
      name,
      description || null,
      id,
    ])

    await connection.end()

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Gejala tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ message: "Gejala berhasil diperbarui" })
  } catch (error) {
    console.error("Error memperbarui gejala:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}

// DELETE - Menghapus data gejala (soft delete atau hard delete) dengan informasi CF rules
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const deleteType = searchParams.get("type") || "soft" // "soft" atau "hard"

    if (!id) {
      return NextResponse.json({ error: "ID gejala wajib diisi" }, { status: 400 })
    }

    const connection = await connectDB()

    // Cek apakah gejala ada dan masih aktif
    const [symptomData] = await connection.execute(
      "SELECT code, name FROM symptoms WHERE id = ? AND is_active = TRUE",
      [id],
    )

    if ((symptomData as any[]).length === 0) {
      await connection.end()
      return NextResponse.json({ error: "Gejala tidak ditemukan atau sudah dihapus" }, { status: 404 })
    }

    const symptomCode = (symptomData as any[])[0].code
    const symptomName = (symptomData as any[])[0].name

    // Cek apakah gejala masih digunakan dalam CF rules dengan detail
    const [cfRules] = await connection.execute(
      `
      SELECT 
        COUNT(*) as count,
        GROUP_CONCAT(DISTINCT disease_code) as disease_codes
      FROM cf_rules 
      WHERE symptom_code = ? AND is_active = TRUE
    `,
      [symptomCode],
    )

    const cfRulesData = (cfRules as any[])[0]
    const cfRulesCount = cfRulesData.count
    const diseaseCodes = cfRulesData.disease_codes

    // Cek apakah gejala digunakan dalam screening answers
    const [screeningAnswers] = await connection.execute(
      "SELECT COUNT(*) as count FROM screening_answers WHERE symptom_code = ?",
      [symptomCode],
    )
    const screeningAnswersCount = (screeningAnswers as any[])[0].count

    if (deleteType === "hard") {
      // Hard delete - hapus permanen
      if (screeningAnswersCount > 0) {
        await connection.end()
        return NextResponse.json(
          {
            error: `Tidak dapat menghapus gejala "${symptomName}" karena sudah digunakan dalam ${screeningAnswersCount} hasil screening. Gunakan soft delete untuk menonaktifkan gejala.`,
            canHardDelete: false,
            screeningCount: screeningAnswersCount,
          },
          { status: 400 },
        )
      }

      try {
        await hardDeleteSymptom(connection, Number.parseInt(id), symptomCode)
        await connection.end()

        return NextResponse.json({
          message: `Gejala "${symptomName}" dan ${cfRulesCount} nilai CF terkait berhasil dihapus permanen.`,
          deletedCfRules: cfRulesCount,
          deleteType: "hard",
        })
      } catch (error) {
        await connection.end()
        console.error("Error hard delete:", error)
        return NextResponse.json({ error: "Gagal menghapus gejala secara permanen" }, { status: 500 })
      }
    } else {
      // Soft delete - nonaktifkan saja
      const [result] = await connection.execute(
        "UPDATE symptoms SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_active = TRUE",
        [id],
      )

      // Soft delete CF rules terkait
      if (cfRulesCount > 0) {
        await connection.execute(
          "UPDATE cf_rules SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE symptom_code = ? AND is_active = TRUE",
          [symptomCode],
        )
      }

      await connection.end()

      if ((result as any).affectedRows === 0) {
        return NextResponse.json({ error: "Gejala tidak ditemukan atau sudah dihapus" }, { status: 404 })
      }

      // Pesan yang berbeda tergantung apakah gejala digunakan dalam CF rules atau tidak
      if (cfRulesCount > 0) {
        const diseaseNames = diseaseCodes
          .split(",")
          .map((code: string) => {
            switch (code) {
              case "P01":
                return "Depresi Ringan"
              case "P02":
                return "Depresi Sedang"
              case "P03":
                return "Depresi Berat"
              default:
                return code
            }
          })
          .join(", ")

        return NextResponse.json({
          message: `Gejala "${symptomName}" berhasil dinonaktifkan. ${cfRulesCount} nilai CF untuk penyakit: ${diseaseNames} juga dinonaktifkan.${screeningAnswersCount > 0 ? ` Data screening (${screeningAnswersCount} records) tetap tersimpan.` : ""}`,
          cf_rules_affected: cfRulesCount,
          disease_codes_affected: diseaseCodes.split(","),
          screening_records: screeningAnswersCount,
          deleteType: "soft",
        })
      } else {
        return NextResponse.json({
          message: `Gejala "${symptomName}" berhasil dinonaktifkan.${screeningAnswersCount > 0 ? ` Data screening (${screeningAnswersCount} records) tetap tersimpan.` : ""}`,
          cf_rules_affected: 0,
          screening_records: screeningAnswersCount,
          deleteType: "soft",
        })
      }
    }
  } catch (error) {
    console.error("Error menghapus gejala:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
