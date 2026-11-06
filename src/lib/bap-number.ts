import { Prisma } from "@prisma/client"
import { prisma } from "./prisma"
import { ROMAN_MONTHS } from "./format"

export function formatBapNumber(seq: number, month: number, year: number) {
  const roman = ROMAN_MONTHS[month - 1] || "I"
  return `${String(seq).padStart(3, "0")}/BAP-BOS/${roman}/${year}`
}

/** Ambil nomor berikutnya tanpa menaikkan counter (untuk preview di form). */
export async function peekNextBapNumber(year: number, month?: number) {
  const currentMonth = month ?? new Date().getMonth() + 1
  try {
    const c = await prisma.counter.findUnique({
      where: { key: `bap:${year}` },
    })
    return formatBapNumber((c?.value ?? 0) + 1, currentMonth, year)
  } catch (error) {
    console.error("Error in peekNextBapNumber:", error)
    return formatBapNumber(1, currentMonth, year)
  }
}

/** Dipakai saat SUBMIT — atomik dan aman untuk request bersamaan. */
export async function takeNextBapNumber(
  tx: Prisma.TransactionClient,
  year: number,
  month: number
) {
  const c = await tx.counter.upsert({
    where: { key: `bap:${year}` },
    create: { key: `bap:${year}`, value: 1 },
    update: { value: { increment: 1 } },
  })
  return formatBapNumber(c.value, month, year)
}
