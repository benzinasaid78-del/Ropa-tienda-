export const digits = (v) => (v || '').replace(/\D/g, '')
export const waLink = (store, text) =>
  `https://wa.me/${digits(store.whatsapp)}${text ? `?text=${encodeURIComponent(text)}` : ''}`
export const money = (n, cur = 'EUR') =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n)
