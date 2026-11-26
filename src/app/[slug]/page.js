import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { money } from '@/lib/util'
import ContactBar from '../ContactBar'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { data } = await supabase.from('stores').select('name').eq('slug', params.slug).maybeSingle()
  return { title: data?.name || 'Tienda' }
}

export default async function StorePage({ params }) {
  const { data: store } = await supabase.from('stores').select('*').eq('slug', params.slug).maybeSingle()
  if (!store) notFound()
  const { data: products } = await supabase
    .from('products').select('*').eq('store_id', store.id).eq('active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="wrap">
      <div className="top"><span className="logo">{store.name}</span></div>
      <section className="hero" style={store.hero_image_url ? { backgroundImage: `linear-gradient(#0008,#0f0f10),url(${store.hero_image_url})` } : undefined}>
        <div>
          <h1>{store.hero_title}</h1>
          {store.opening_hours && <p>{store.opening_hours}</p>}
          {store.address && <p>{store.address}</p>}
        </div>
      </section>
      <section className="grid">
        {(products || []).map((p) => (
          <Link key={p.id} href={`/${store.slug}/${p.id}`} className="card">
            <div className="ph">{p.images?.[0] && <img src={p.images[0]} alt={p.name} loading="lazy" />}</div>
            <div className="row"><span className="name">{p.name}</span><span className="price">{money(p.price, store.currency)}</span></div>
          </Link>
        ))}
      </section>
      {!products?.length && <p className="empty">Próximamente.</p>}
      <ContactBar store={store} text={`Hola, vi su catálogo en ${store.name}.`} />
    </div>
  )
}
