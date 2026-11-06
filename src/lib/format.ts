import { format, parseISO } from "date-fns"
import { id as localeId } from "date-fns/locale"

export const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

export const ROMAN_MONTHS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
]

function toDate(d: Date | string | number): Date {
  if (typeof d === "string") return parseISO(d)
  if (typeof d === "number") return new Date(d)
  return d
}

export function formatDateId(
  date: Date | string | number | null | undefined,
  pattern = "dd MMMM yyyy"
): string {
  if (!date) return "-"
  try {
    return format(toDate(date), pattern, { locale: localeId })
  } catch {
    return "-"
  }
}

export function formatTimeId(
  date: Date | string | number | null | undefined
): string {
  if (!date) return "-"
  try {
    return `${format(toDate(date), "HH:mm", { locale: localeId })} WIB`
  } catch {
    return "-"
  }
}

export function formatDateTimeId(
  date: Date | string | number | null | undefined
): string {
  if (!date) return "-"
  try {
    return `${formatDateId(date, "EEEE, dd MMMM yyyy")} · ${formatTimeId(date)}`
  } catch {
    return "-"
  }
}

export function formatNumberId(num: number | null | undefined): string {
  if (num === null || num === undefined) return "0"
  return new Intl.NumberFormat("id-ID").format(num)
}
