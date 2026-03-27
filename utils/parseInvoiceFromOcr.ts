/**
 * Parse OCR text from an invoice/receipt to extract description, total amount, and date.
 * Handles USD, INR (₹), and common receipt formats including Indian DD/MM/YY.
 */
export interface ParsedInvoice {
  description: string
  amount: number
  date: string
}

// Order matters: prefer Grand Total, then explicit totals, then rupee/dollar amounts. Require sensible min.
const CURRENCY_PATTERNS = [
  // Indian: Grand Total ₹2703.00 or Grand Total: 2703.00 (OCR may drop ₹)
  /grand\s+total[\s:]*[₹Rs.]?\s*([\d,]+\.?\d*)/i,
  /grand\s+total[\s:]*([\d,]+\.?\d*)/i,
  /(?:total|amount|balance\s+due)[\s:]*[₹Rs.$]?\s*([\d,]+\.?\d*)/i,
  // Rupee symbol or Rs
  /[₹Rs.]\s*([\d,]+\.?\d{2})/,
  /(?:USD|INR|usd|inr)[\s:]*([\d,]+\.?\d*)/i,
  // Dollar
  /\$\s*([\d,]+\.?\d*)/,
  // Standalone amount with 2 decimals (likely total) - prefer larger amounts
  /\b([\d,]+\.\d{2})\s*$/m,
  /\b([\d,]+\.\d{2})\b/,
]

const MIN_SENSIBLE_AMOUNT = 1
const MAX_AMOUNT = 1e7

// Date: prefer "Date:" or "Bill No" nearby, support DD/MM/YY (India) and MM/DD/YY
const DATE_PATTERNS = [
  // Date: 06/01/26 or Date 06-01-2026 (DD/MM/YY or DD/MM/YYYY)
  /(?:date|bill\s+no\.?|dated)[\s:]*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i,
  // Standalone DD/MM/YY at start of line (common on receipts)
  /^\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/m,
  /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,
  /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
]

const MONTH_NAMES: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

/** Parse 3 numeric groups as DD/MM/YY or DD/MM/YYYY (India style). */
function parseDDMMYY(a: string, b: string, c: string): string | null {
  const n1 = parseInt(a, 10)
  const n2 = parseInt(b, 10)
  const year = c.length === 2 ? 2000 + parseInt(c, 10) : parseInt(c, 10)
  if (year < 1900 || year > 2100) return null
  let day: number
  let month: number
  // If first is <= 31 and second <= 12, treat as DD/MM
  if (n1 <= 31 && n2 <= 12 && n1 >= 1 && n2 >= 1) {
    day = n1
    month = n2
  } else if (n2 <= 31 && n1 <= 12 && n2 >= 1 && n1 >= 1) {
    day = n2
    month = n1
  } else return null
  const d = new Date(year, month - 1, day)
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
}

function parseDate(text: string): string {
  const today = new Date().toISOString().slice(0, 10)
  for (const pattern of DATE_PATTERNS) {
    const m = text.match(pattern)
    if (m && m.length >= 4) {
      const parsed = parseDDMMYY(m[1], m[2], m[3])
      if (parsed) return parsed
    }
  }
  return today
}

function parseAmount(text: string): number {
  const normalized = text.replace(/\s+/g, ' ')
  let best = 0
  // 1) Grand Total first (receipts usually have one; we want this over Sub Total)
  const grandMatch = normalized.match(/grand\s+total[\s:]*[₹Rs.]?\s*([\d,]+\.?\d*)/i)
  if (grandMatch) {
    const num = parseFloat(grandMatch[1].replace(/,/g, ''))
    if (Number.isFinite(num) && num >= MIN_SENSIBLE_AMOUNT && num < MAX_AMOUNT) {
      return Math.round(num * 100) / 100
    }
  }
  // 2) All "total" / "amount" lines: take the largest (Grand Total > Sub Total)
  const totalRegex = /(?:grand\s+total|total|amount)[\s:]*[₹Rs.$]?\s*([\d,]+\.?\d*)/gi
  let m: RegExpExecArray | null
  while ((m = totalRegex.exec(normalized)) !== null) {
    const before = normalized.slice(Math.max(0, m.index - 15), m.index).toLowerCase()
    if (before.includes('sub') && !before.includes('grand')) continue
    const num = parseFloat(m[1].replace(/,/g, ''))
    if (Number.isFinite(num) && num >= MIN_SENSIBLE_AMOUNT && num < MAX_AMOUNT && num > best) {
      best = num
    }
  }
  if (best > 0) return Math.round(best * 100) / 100
  // 3) Fallback
  for (const pattern of CURRENCY_PATTERNS) {
    const match = normalized.match(pattern)
    if (match) {
      const num = parseFloat(match[1].replace(/,/g, ''))
      if (Number.isFinite(num) && num >= MIN_SENSIBLE_AMOUNT && num < MAX_AMOUNT) {
        return Math.round(num * 100) / 100
      }
    }
  }
  return 0
}

/** Reject lines that look like OCR garbage (mostly symbols) or receipt labels. */
function isLikelyGarbageOrLabel(line: string): boolean {
  const trimmed = line.trim()
  if (trimmed.length < 3) return true
  const letters = (trimmed.match(/[a-zA-Z]/g) || []).length
  const total = trimmed.length
  if (total > 0 && letters / total < 0.4) return true
  if (/^[\s|=\-\.\_]+/.test(trimmed) || /^\d+[.,]\d{2}\s*$/.test(trimmed)) return true
  if (/^(receipt|invoice|thank you|date|time|total|subtotal|sub\s+total|grand\s+total|tax|gst|qty|item|amount|price|bill|cashier|name:|#|\d+\s*$)/i.test(trimmed)) return true
  return false
}

/** Get merchant/description: first line that looks like a business name. Merge lines split at apostrophe (e.g. "Bo'" + "s Paradise"). */
function parseDescription(text: string): string {
  const lines = text
    .split(/[\r\n]+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !isLikelyGarbageOrLabel(l))
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].slice(0, 120)
    if (line.length < 2 || !/[a-zA-Z]{2,}/.test(line)) continue
    if (line.endsWith("'") && i + 1 < lines.length) {
      const next = lines[i + 1].trim()
      if (/^['s]/i.test(next)) {
        line = (line + next).slice(0, 120)
      }
    }
    if (line.length >= 4) return line
  }
  return 'Invoice'
}

export function parseInvoiceFromOcr(ocrText: string): ParsedInvoice {
  const description = parseDescription(ocrText)
  const amount = parseAmount(ocrText)
  const date = parseDate(ocrText)
  return { description, amount, date }
}
