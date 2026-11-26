import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { data: stores } = await supabase.from('stores').select('slug,name').order('created_at')
  return (
    <div className="wrap">
      <div className="top"><span className="logo">Tiendas</span><Link className="btn" href="/admin">Admin</Link></div>
      <div className="grid">
        {(stores || []).map((s) => (
          <Link key={s.slug} href={`/${s.slug}`} className="card"><span className="name">{s.name}</span></Link>
        ))}
      </div>
      {!stores?.length && <p className="empty">Aún no hay tiendas.</p>}
    </div>
  )
}
