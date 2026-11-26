'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const EMPTY = { name: '', price: '', description: '', sizes: '', colors: '', active: true, images: [] }
const STORE_FIELDS = [
  ['name', 'اسم المحل'], ['hero_title', 'عنوان البانر'], ['whatsapp', 'واتساب (مع رمز الدولة)'],
  ['phone', 'الهاتف'], ['instagram', 'إنستغرام'], ['address', 'العنوان'],
  ['maps_url', 'رابط Google Maps'], ['opening_hours', 'أوقات العمل'], ['hero_image_url', 'رابط صورة البانر (اختياري)'],
]
const list = (s) => s.split(',').map((x) => x.trim()).filter(Boolean)

export default function Admin() {
  const r = useRouter()
  const [user, setUser] = useState(null)
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [ready, setReady] = useState(false)
  const [msg, setMsg] = useState('')
  const [newShop, setNewShop] = useState({ name: '', slug: '' })

  async function load(uid) {
    const { data: s } = await supabase.from('stores').select('*').eq('owner_id', uid).maybeSingle()
    setStore(s)
    if (s) {
      const { data: p } = await supabase.from('products').select('*').eq('store_id', s.id).order('created_at', { ascending: false })
      setProducts(p || [])
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user
      if (!u) return r.replace('/admin/login')
      setUser(u)
      await load(u.id)
      setReady(true)
    })
  }, [])

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(''), 2500) }

  async function createShop() {
    const slug = newShop.slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (!newShop.name || !slug) return flash('أدخل الاسم والرابط (حروف إنجليزية)')
    const { error } = await supabase.from('stores').insert({ owner_id: user.id, name: newShop.name, slug })
    if (error) return flash(error.message)
    load(user.id)
  }

  async function saveStore() {
    const { id, owner_id, created_at, ...rest } = store
    const { error } = await supabase.from('stores').update(rest).eq('id', id)
    flash(error ? error.message : 'تم حفظ بيانات المحل')
  }

  async function upload(files) {
    const urls = []
    for (const f of files) {
      const path = `${store.id}/${Date.now()}-${f.name.replace(/[^\w.]/g, '_')}`
      const { error } = await supabase.storage.from('product-images').upload(path, f)
      if (error) { flash(error.message); continue }
      urls.push(supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl)
    }
    setForm((x) => ({ ...x, images: [...x.images, ...urls] }))
  }

  async function saveProduct() {
    if (!form.name || form.price === '') return flash('الاسم والسعر مطلوبان')
    const row = {
      store_id: store.id, name: form.name, price: Number(form.price), description: form.description,
      sizes: Array.isArray(form.sizes) ? form.sizes : list(form.sizes),
      colors: Array.isArray(form.colors) ? form.colors : list(form.colors),
      active: form.active, images: form.images,
    }
    const q = editId ? supabase.from('products').update(row).eq('id', editId) : supabase.from('products').insert(row)
    const { error } = await q
    if (error) return flash(error.message)
    setForm(EMPTY); setEditId(null); flash('تم الحفظ'); load(user.id)
  }

  function edit(p) {
    setEditId(p.id)
    setForm({ ...p, price: String(p.price), sizes: (p.sizes || []).join(', '), colors: (p.colors || []).join(', '), description: p.description || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function remove(id) {
    if (!confirm('حذف المنتج؟')) return
    await supabase.from('products').delete().eq('id', id)
    load(user.id)
  }

  if (!ready) return <p className="empty">...</p>

  return (
    <div className="adm" dir="rtl">
      <div className="row">
        <h2>لوحة التحكم</h2>
        <button className="btn" onClick={async () => { await supabase.auth.signOut(); r.replace('/admin/login') }}>خروج</button>
      </div>
      {msg && <div className="msg">{msg}</div>}

      {!store ? (
        <div className="box">
          <p>أنشئ محلك الأول</p>
          <label>اسم المحل<input value={newShop.name} onChange={(e) => setNewShop({ ...newShop, name: e.target.value })} /></label>
          <label>رابط المحل (إنجليزي، مثال: lastdept)<input dir="ltr" value={newShop.slug} onChange={(e) => setNewShop({ ...newShop, slug: e.target.value })} /></label>
          <button className="btn fill" onClick={createShop}>إنشاء</button>
        </div>
      ) : (
        <>
          <p className="muted">رابط محلك: <a dir="ltr" href={`/${store.slug}`} target="_blank">/{store.slug}</a></p>
          <h2>بيانات المحل</h2>
          <div className="box">
            {STORE_FIELDS.map(([k, label]) => (
              <label key={k}>{label}<input value={store[k] || ''} onChange={(e) => setStore({ ...store, [k]: e.target.value })} /></label>
            ))}
            <button className="btn fill" onClick={saveStore}>حفظ</button>
          </div>

          <h2>{editId ? 'تعديل منتج' : 'إضافة منتج'}</h2>
          <div className="box">
            <label>الاسم<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>السعر<input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
            <label>الوصف<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label>المقاسات (مفصولة بفاصلة: S, M, L)<input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} /></label>
            <label>الألوان (مفصولة بفاصلة)<input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} /></label>
            <label>الصور (الأولى هي صورة البطاقة)<input type="file" accept="image/*" multiple onChange={(e) => upload([...e.target.files])} /></label>
            <div className="imgs">
              {form.images.map((u) => (
                <div key={u}><img src={u} alt="" /><button onClick={() => setForm({ ...form, images: form.images.filter((x) => x !== u) })}>×</button></div>
              ))}
            </div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input style={{ width: 'auto' }} type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> ظاهر في الموقع
            </label>
            <button className="btn fill" onClick={saveProduct}>{editId ? 'حفظ التعديل' : 'إضافة'}</button>
            {editId && <button className="btn" onClick={() => { setEditId(null); setForm(EMPTY) }}>إلغاء</button>}
          </div>

          <h2>المنتجات ({products.length})</h2>
          {products.map((p) => (
            <div className="item" key={p.id}>
              {p.images?.[0] && <img src={p.images[0]} alt="" />}
              <div className="grow"><b>{p.name}</b><div className="muted">{p.price} {p.active ? '' : '· مخفي'}</div></div>
              <button className="btn" onClick={() => edit(p)}>تعديل</button>
              <button className="btn red" onClick={() => remove(p.id)}>حذف</button>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
