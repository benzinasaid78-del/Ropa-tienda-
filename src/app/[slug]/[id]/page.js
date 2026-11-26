import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { money, waLink } from '@/lib/util'
import ContactBar from '../../ContactBar'

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }) {
  const { data: store } = await supabase.from('stores').select('*').eq('slug', params.slug).maybeSingle()
  if (!store) notFound()
  const { data: p } = await supabase.from('products').select('*').eq('id', params.id).eq('store_id', store.id).maybeSingle()
  if (!p) notFound()
  const text = `Hola, me interesa este producto: ${p.name} (${money(p.price, store.currency)})`

  return (
    <div className="wrap">
      <div className="top"><Link className="logo" href={`/${store.slug}`}>← {store.name}</Link></div>
      <div className="pg">
        <div>
          <div className="main-img">{p.images?.[0] && <img src={p.images[0]} alt={p.name} />}</div>
          {p.images?.length > 1 && (
            <div className="thumbs">{p.images.slice(1).map((u) => <img key={u} src={u} alt="" />)}</div>
          )}
        </div>
        <div>
          <h1 className="name" style={{ fontSize: 20 }}>{p.name}</h1>
          <p className="price" style={{ fontSize: 24, margin: '8px 0' }}>{money(p.price, store.currency)}</p>
          {p.description && <p className="muted" style={{ marginBottom: 14 }}>{p.description}</p>}
          {p.sizes?.length > 0 && <><p className="muted">Tallas</p><div className="chips">{p.sizes.map((s) => <span className="chip" key={s}>{s}</span>)}</div></>}
          {p.colors?.length > 0 && <><p className="muted">Colores</p><div className="chips">{p.colors.map((s) => <span className="chip" key={s}>{s}</span>)}</div></>}
          {store.whatsapp && <a className="btn wa" href={waLink(store, text)} target="_blank" rel="noreferrer">Preguntar por este producto</a>}
        </div>
      </div>
      <ContactBar store={store} text={text} />
    </div>
  )
}
