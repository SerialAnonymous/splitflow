export interface Settlement {
  id: string
  group_id: string
  payer_id: string
  receiver_id: string
  amount: number
  note: string | null
  date: string
  created_at: string
}

export interface SettlementWithUsers extends Settlement {
  payer?: { id: string; name: string | null; email: string }
  receiver?: { id: string; name: string | null; email: string }
}

export interface RecordSettlementPayload {
  payer: string
  receiver: string
  amount: number
  date: string
  note?: string | null
}
