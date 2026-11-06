import QRCode from "qrcode"
import crypto from "crypto"

export function generateQrToken(): string {
  return crypto.randomBytes(16).toString("hex")
}

export function getVerifyUrl(token: string): string {
  const base =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://inventaris.smkhkti2.sch.id"
  return `${base.replace(/\/$/, "")}/verify/${token}`
}

export async function bapQrSvg(token: string): Promise<string> {
  const url = getVerifyUrl(token)
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

export async function bapQrDataUrl(token: string): Promise<string> {
  const url = getVerifyUrl(token)
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
