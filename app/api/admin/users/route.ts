import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/database"
import { verifyAdminToken } from "@/lib/auth"

// GET - Mengambil semua data users
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const connection = await connectDB()

    const [rows] = await connection.execute(`
      SELECT 
        id,
        username,
        email,
        full_name,
        date_of_birth,
        gender,
        phone,
        created_at,
        updated_at
      FROM users 
      ORDER BY created_at DESC
    `)

    await connection.end()

    return NextResponse.json({ users: rows })
  } catch (error) {
    console.error("Error mengambil data users:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}

// DELETE - Hard delete user (karena tidak ada is_active column)
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID user wajib diisi" }, { status: 400 })
    }

    const connection = await connectDB()

    // Cek apakah user memiliki data screening results
    // const [screeningResults] = await connection.execute(
    //   "SELECT COUNT(*) as count FROM screening_results WHERE user_id = ?",
    //   [id],
    // )

    // if ((screeningResults as any[])[0].count > 0) {
    //   await connection.end()
    //   return NextResponse.json(
    //     {
    //       error:
    //         "User tidak dapat dihapus karena memiliki riwayat screening. Data akan tetap disimpan untuk keperluan analisis.",
    //     },
    //     { status: 409 },
    //   )
    // }

    // Hard delete user jika tidak ada riwayat screening
    const [result] = await connection.execute("DELETE FROM users WHERE id = ?", [id])

    await connection.end()

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ message: "User berhasil dihapus" })
  } catch (error) {
    console.error("Error menghapus user:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}

// PUT - Update data user
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { id, full_name, email, phone, date_of_birth, gender } = await request.json()

    if (!id || !full_name || !email) {
      return NextResponse.json({ error: "ID, nama lengkap, dan email wajib diisi" }, { status: 400 })
    }

    const connection = await connectDB()

    // Cek apakah email sudah digunakan user lain
    const [existing] = await connection.execute("SELECT id FROM users WHERE email = ? AND id != ?", [email, id])

    if ((existing as any[]).length > 0) {
      await connection.end()
      return NextResponse.json({ error: "Email sudah digunakan oleh user lain" }, { status: 409 })
    }

    const [result] = await connection.execute(
      "UPDATE users SET full_name = ?, email = ?, phone = ?, date_of_birth = ?, gender = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [full_name, email, phone || null, date_of_birth || null, gender || null, id],
    )

    await connection.end()

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ message: "Data user berhasil diperbarui" })
  } catch (error) {
    console.error("Error mengupdate data user:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
