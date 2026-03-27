/**
 * Intelligent invoice parser that works across many formats.
 * Uses multiple strategies + scoring instead of fixed regex order.
 */
export interface ParsedInvoice {
  description: string
  amount: number
  date: string
}

export interface CandidateAmount {
  value: number
  score: number
  context: string
}

export interface CandidateDate {
  value: string
  score: number
}

export interface CandidateDescription {
  value: string
  score: number
}

const MIN_AMOUNT = 0.01
const MAX_AMOUNT = 1e7

// Keywords that strongly indicate "this is the final total"
const TOTAL_KEYWORDS = [
  { pattern: /grand\s+total|total\s+due|amount\s+due|balance\s+due|final\s+total/i, score: 100 },
  { pattern: /(?:^|\s)total[\s:]*$/im, score: 80 },
  { pattern: /(?:^|\s)amount[\s:]*$/im, score: 70 },
  { pattern: /(?:^|\s)sum[\s:]*$/im, score: 60 },
  { pattern: /sub\s*total|subtotal/i, score: 20 },
]

// Currency symbols and abbreviations
const CURRENCY_SYMBOLS = /[₹$€£Rs\.]|USD|INR|EUR|GBP/i

function extractAmountCandidates(text: string): CandidateAmount[] {
  const candidates: CandidateAmount[] = []
  if (!text || text.length < 2) return candidates
  const normalized = text.replace(/\s+/g, ' ')
  const lines = text.split(/\r?\n/)

  // Strategy 1: Find "keyword" followed by amount on same or next line
  for (const { pattern, score } of TOTAL_KEYWORDS) {
    const regex = new RegExp(pattern.source + '[\\s:]*[₹Rs.$]?\\s*([\\d,]+\\.?\\d*)', 'gim')
    let m: RegExpExecArray | null
    while ((m = regex.exec(text)) !== null) {
      const raw = m[1]
      if (raw == null || typeof raw !== 'string') continue
      const context = normalized.slice(Math.max(0, m.index - 30), m.index + m[0].length)
      const isSubTotal = /sub\s*total|subtotal/i.test(context) && !/grand\s+total/i.test(context)
      if (isSubTotal) continue
      const num = parseFloat(raw.replace(/,/g, ''))
      if (Number.isFinite(num) && num >= MIN_AMOUNT && num < MAX_AMOUNT) {
        candidates.push({ value: num, score, context: m[0] })
      }
    }
  }

  // Strategy 1b: "Grand Total" often on one line, amount on next – look for amount within 60 chars after "grand total"
  const grandTotalRegex = /grand\s+total[\s:]*[₹Rs.$]?/gi
  let gm: RegExpExecArray | null
  while ((gm = grandTotalRegex.exec(text)) !== null) {
    const after = text.slice(gm.index + gm[0].length, gm.index + gm[0].length + 60)
    const amountMatch = after.match(/([\d,]+\.?\d{2})/)
    if (amountMatch && amountMatch[1] != null) {
      const num = parseFloat(String(amountMatch[1]).replace(/,/g, ''))
      if (Number.isFinite(num) && num >= MIN_AMOUNT && num < MAX_AMOUNT) {
        candidates.push({ value: num, score: 100, context: 'Grand Total ' + amountMatch[1] })
      }
    }
  }

  // Strategy 2: Currency symbol + amount anywhere
  const currencyRegex = /[₹$€£Rs.]\s*([\d,]+\.?\d{2})|([\d,]+\.?\d{2})\s*(?:USD|INR|EUR)/gi
  let match: RegExpExecArray | null
  while ((match = currencyRegex.exec(normalized)) !== null) {
    const raw = match[1] ?? match[2]
    if (raw == null || typeof raw !== 'string') continue
    const context = normalized.slice(Math.max(0, match.index - 25), match.index + match[0].length)
    if (/sub\s*total|subtotal/i.test(context) && !/grand\s+total/i.test(context)) continue
    const num = parseFloat(raw.replace(/,/g, ''))
    if (Number.isFinite(num) && num >= MIN_AMOUNT && num < MAX_AMOUNT) {
      const pos = match.index / normalized.length
      const positionScore = pos > 0.5 ? 25 : 10
      candidates.push({ value: num, score: positionScore, context: match[0] })
    }
  }

  // Strategy 3: Amounts at end of lines (totals often right-aligned) – skip sub total
  for (const line of lines) {
    if (/sub\s*total|subtotal/i.test(line) && !/grand\s+total/i.test(line)) continue
    const endMatch = line.match(/([\d,]+\.\d{2})\s*$/)
    if (endMatch && endMatch[1] != null) {
      const num = parseFloat(String(endMatch[1]).replace(/,/g, ''))
      if (Number.isFinite(num) && num >= MIN_AMOUNT && num < MAX_AMOUNT) {
        const hasKeyword = /total|amount|sum|balance|grand/i.test(line)
        candidates.push({ value: num, score: hasKeyword ? 50 : 20, context: line.trim() })
      }
    }
  }

  return candidates
}

function pickBestAmount(candidates: CandidateAmount[]): number {
  if (candidates.length === 0) return 0
  const byValue = new Map<number, number>()
  for (const c of candidates) {
    const rounded = Math.round(c.value * 100) / 100
    const existing = byValue.get(rounded) ?? 0
    byValue.set(rounded, Math.max(existing, c.score))
  }
  let bestValue = 0
  let bestScore = 0
  byValue.forEach((score, value) => {
    if (score > bestScore || (score === bestScore && value > bestValue)) {
      bestScore = score
      bestValue = value
    }
  })
  return bestValue
}

const DATE_NUMERIC = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g
const DATE_ISO = /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g

function parseDateParts(a: string, b: string, c: string): string | null {
  const n1 = parseInt(a, 10)
  const n2 = parseInt(b, 10)
  const year = c.length === 2 ? 2000 + parseInt(c, 10) : parseInt(c, 10)
  if (year < 1900 || year > 2100) return null
  let day: number
  let month: number
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

function extractDateCandidates(text: string): CandidateDate[] {
  const candidates: CandidateDate[] = []
  if (!text || text.length < 2) return candidates
  const dateKeywords = /(?:date|dated|bill\s+date|invoice\s+date|doe)[\s:]*/gi

  function addMatch(m: RegExpMatchArray, position: number, nearKeyword: boolean) {
    if (m[1] == null || m[2] == null || m[3] == null) return
    const parsed = parseDateParts(m[1], m[2], m[3])
    if (parsed) {
      const score = nearKeyword ? 90 : position < 0.3 ? 50 : 30
      candidates.push({ value: parsed, score })
    }
  }

  let m: RegExpExecArray | null
  DATE_NUMERIC.lastIndex = 0
  while ((m = DATE_NUMERIC.exec(text)) !== null) {
    const pos = m.index / text.length
    const before = text.slice(Math.max(0, m.index - 40), m.index)
    addMatch(m, pos, dateKeywords.test(before))
  }
  DATE_ISO.lastIndex = 0
  while ((m = DATE_ISO.exec(text)) !== null) {
    const pos = m.index / text.length
    const before = text.slice(Math.max(0, m.index - 40), m.index)
    addMatch(m, pos, dateKeywords.test(before))
  }

  return candidates
}

function pickBestDate(candidates: CandidateDate[]): string {
  const today = new Date().toISOString().slice(0, 10)
  if (candidates.length === 0) return today
  const best = candidates.reduce((a, b) => (a.score >= b.score ? a : b))
  return best.value
}

const LABEL_LINE = /^(receipt|invoice|thank you|date|time|total|subtotal|sub\s+total|grand\s+total|tax|gst|qty|item|amount|price|bill|cashier|name:|#|\d+\s*$)/i
const GARBAGE_START = /^[\s|=.\_-]+/
const BUSINESS_WORDS = /\b(restaurant|cafe|coffee|hotel|store|shop|ltd|llp|inc|corp|paradise|grill|bar|kitchen|foods|mart)\b/i
const ADDRESS_LINE = /S\.?\s*NO\.?|SND\.?|\d{2,}\s*[-–]\s*\d{2,}|LLP\s+[A-Z]*\s*\d|,\s*[A-Z]{2,}\s+[A-Z]{2,}\s+,/

function isLabelOrGarbage(line: string): boolean {
  const t = line.trim()
  if (t.length < 2) return true
  const letters = (t.match(/[a-zA-Z]/g) || []).length
  if (t.length > 0 && letters / t.length < 0.35) return true
  if (GARBAGE_START.test(t) || /^\d+[.,]\d{2}\s*$/.test(t)) return true
  if (LABEL_LINE.test(t)) return true
  return false
}

function looksLikeAddress(line: string): boolean {
  if ((line.match(/,/g) || []).length > 2) return true
  if (ADDRESS_LINE.test(line)) return true
  if (/\d{3,}/.test(line) && /(road|street|st\.?|ave|address|s\.?\s*no)/i.test(line)) return true
  return false
}

function extractDescriptionCandidates(text: string): CandidateDescription[] {
  const candidates: CandidateDescription[] = []
  if (!text || text.length < 2) return candidates
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0)
  const totalLen = text.length

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    if (isLabelOrGarbage(line)) continue
    if (looksLikeAddress(line)) continue
    if (line.length < 3 || !/[a-zA-Z]{2,}/.test(line)) continue

    if (line.endsWith("'") && i + 1 < lines.length) {
      const next = lines[i + 1].trim()
      if (/^['s]/i.test(next)) line = (line + next).slice(0, 100)
    }

    const clean = line.slice(0, 100)
    if (clean.length < 4) continue

    const position = text.indexOf(line) / totalLen
    let score = 0
    if (position < 0.1) score += 70
    else if (position < 0.2) score += 55
    else if (position < 0.35) score += 35
    else if (position < 0.6) score += 10
    if (BUSINESS_WORDS.test(clean)) score += 40
    if (/^[A-Z][a-z]/.test(clean) || (clean.match(/[A-Z]/g)?.length ?? 0) >= 2) score += 20
    if (clean.length >= 4 && clean.length <= 45) score += 25
    else if (clean.length <= 60) score += 10
    if (clean.length > 60) score -= 15
    const capsRatio = (clean.match(/[A-Z]/g) || []).length / (clean.match(/[A-Za-z]/g)?.length || 1)
    if (capsRatio > 0.8) score -= 25
    else if (capsRatio < 0.5 && /[a-z]/.test(clean)) score += 15
    if (/'/.test(clean)) score += 10

    candidates.push({ value: clean, score })
  }

  return candidates
}

function pickBestDescription(candidates: CandidateDescription[]): string {
  if (candidates.length === 0) return 'Invoice'
  const best = candidates.reduce((a, b) => (a.score >= b.score ? a : b))
  return best.value
}

/**
 * Parse invoice from raw OCR text using multiple strategies and scoring.
 * Works across many receipt/invoice layouts without format-specific regex.
 */
export function parseInvoiceSmart(ocrText: string): ParsedInvoice {
  const text = typeof ocrText === 'string' ? ocrText : ''
  const amountCandidates = extractAmountCandidates(text)
  const dateCandidates = extractDateCandidates(text)
  const descriptionCandidates = extractDescriptionCandidates(text)

  const amount = pickBestAmount(amountCandidates)
  const date = pickBestDate(dateCandidates)
  const description = pickBestDescription(descriptionCandidates)

  return {
    description: description || 'Invoice',
    amount,
    date: date || new Date().toISOString().slice(0, 10),
  }
}
