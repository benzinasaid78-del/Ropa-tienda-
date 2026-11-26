'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const r = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  async function go(mode) {
    setMsg('')
    const fn = mode === 'in' ? supabase.auth.signInWithPassword : supabase.auth.signUp
    const { data, error } = await fn.call(supabase.auth, { email, password })
    if (error) return setMsg(error.message)
    if (data.session) r.replace('/admin')
    else setMsg('Revisa tu correo para confirmar la cuenta.')
  }

  return (
    <div className="adm" dir="rtl">
      <h2>تسجيل الدخول</h2>
      <div className="box">
        {msg && <div className="msg">{msg}</div>}
        <label>البريد الإلكتروني<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>كلمة المرور<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="btn fill" onClick={() => go('in')}>دخول</button>
        <button className="btn" onClick={() => go('up')}>إنشاء حساب</button>
      </div>
    </div>
  )
}
