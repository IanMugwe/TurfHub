/** "KES 2,500" — whole shillings, grouped the same on every device */
export function formatKES(amount: number) {
  return `KES ${Math.round(amount).toLocaleString('en-US')}`
}

/** Any Kenyan mobile format → "+254712345678", or null if it isn't one */
export function normalizePhoneKE(input: string): string | null {
  let d = input.replace(/\D/g, '')
  if (d.startsWith('254')) d = d.slice(3)
  else if (d.startsWith('0')) d = d.slice(1)
  return /^[17]\d{8}$/.test(d) ? `+254${d}` : null
}

/** "+254712345678" → "+254 712 345 678" */
export function formatPhoneKE(input: string) {
  const n = normalizePhoneKE(input)
  if (!n) return input
  const d = n.slice(4)
  return `+254 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
}

/** Phone number as a URL segment: "+254 712 345 678" → "254712345678" */
export function phoneToParam(phone: string) {
  return normalizePhoneKE(phone)?.slice(1) ?? phone.replace(/\D/g, '')
}
