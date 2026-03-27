const BUCKET = 'receipts'
const SIGNED_URL_EXPIRY_SEC = 3600

/**
 * Get a signed URL for a receipt storage path (for private bucket).
 * Use when displaying or opening a receipt from storage.
 */
export function useReceiptUrl() {
  const { $supabase } = useNuxtApp()

  async function getSignedUrl(path: string): Promise<string | null> {
    if (!$supabase) return null
    const { data, error } = await $supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_URL_EXPIRY_SEC)
    if (error) return null
    return data?.signedUrl ?? null
  }

  async function openReceipt(path: string) {
    const url = await getSignedUrl(path)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  return { getSignedUrl, openReceipt }
}
