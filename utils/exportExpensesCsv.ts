import type { ExpenseWithParticipants } from '~/types/expense'

function csvCell(v: string | number | null | undefined): string {
  const s = String(v ?? '')
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function buildExpensesCsv(expenses: ExpenseWithParticipants[], currency: string): string {
  const headers = ['date', 'description', 'amount', 'currency', 'group_id', 'paid_by', 'category']
  const lines = [headers.join(',')]
  for (const e of expenses) {
    lines.push(
      [
        csvCell((e.date || e.created_at || '').slice(0, 10)),
        csvCell(e.description),
        csvCell(Number(e.amount).toFixed(2)),
        csvCell(currency),
        csvCell(e.group_id),
        csvCell(e.paid_by),
        csvCell(e.category ?? ''),
      ].join(',')
    )
  }
  return lines.join('\n')
}

export function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
