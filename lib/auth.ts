import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

interface AuthResult {
  success: boolean
  user?: any
  error?: string
}

export async function verifyAdminToken(request: NextRequest): Promise<AuthResult> {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return { success: false, error: "No authentication token provided" }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    if (decoded.userType !== "admin") {
      return { success: false, error: "Admin access required" }
    }

    return { success: true, user: decoded }
  } catch (error) {
    return { success: false, error: "Invalid authentication token" }
  }
}

export async function verifyUserToken(request: NextRequest): Promise<AuthResult> {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return { success: false, error: "No authentication token provided" }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    return { success: true, user: decoded }
  } catch (error) {
    return { success: false, error: "Invalid authentication token" }
  }
}
