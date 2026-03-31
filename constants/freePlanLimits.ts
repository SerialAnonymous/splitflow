/** Free tier caps; Pro and Team are unlimited for these features. */
export const FREE_MAX_GROUPS = 1
export const FREE_MAX_MEMBERS_PER_GROUP = 4
/** Rolling window for visible expense / activity history on Free. */
export const FREE_HISTORY_DAYS = 7

export function freeHistoryCutoffMs(): number {
  return Date.now() - FREE_HISTORY_DAYS * 24 * 60 * 60 * 1000
}

export function isExpenseWithinFreeHistory(dateOrCreated: string | null | undefined): boolean {
  if (!dateOrCreated) return true
  const t = new Date(dateOrCreated).getTime()
  if (Number.isNaN(t)) return true
  return t >= freeHistoryCutoffMs()
}
