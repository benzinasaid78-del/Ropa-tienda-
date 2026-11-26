import { waLink } from '@/lib/util'

export default function ContactBar({ store, text }) {
  return (
    <div className="bar">
      {store.whatsapp && <a className="btn wa" href={waLink(store, text)} target="_blank" rel="noreferrer">WhatsApp</a>}
      {store.phone && <a className="btn" href={`tel:${store.phone}`}>Llamar</a>}
      {store.maps_url && <a className="btn" href={store.maps_url} target="_blank" rel="noreferrer">Ubicación</a>}
      {store.instagram && (
        <a className="btn" href={`https://instagram.com/${store.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">Instagram</a>
      )}
    </div>
  )
}
