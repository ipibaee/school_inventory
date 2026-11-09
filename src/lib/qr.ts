import QRCode from "qrcode"
import crypto from "crypto"

export function generateQrToken(): string {
  return crypto.randomBytes(16).toString("hex")
}

export function getVerifyUrl(token: string, baseUrl?: string): string {
  let base = baseUrl

  if (!base && typeof window !== "undefined" && window.location?.origin) {
    base = window.location.origin
  }

  if (!base) {
    const vercelHost =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : undefined) ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)

    base = vercelHost || "http://localhost:3000"
  }

  return `${base.replace(/\/$/, "")}/verify/${token}`
}

export async function bapQrSvg(token: string, baseUrl?: string): Promise<string> {
  const url = getVerifyUrl(token, baseUrl)
  return QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: {
      dark: "#0B1B2E",
      light: "#FFFFFF",
    },
  })
}

export async function bapQrDataUrl(token: string, baseUrl?: string): Promise<string> {
  const url = getVerifyUrl(token, baseUrl)
  return QRCode.toDataURL(url, {
    margin: 1,
    width: 256,
    errorCorrectionLevel: "M",
    color: {
      dark: "#0B1B2E",
      light: "#FFFFFF",
    },
  })
}
