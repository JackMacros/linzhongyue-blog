import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { LoaderCircle, LockKeyhole } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { inputCls } from '@/components/admin'

export default function Login() {
  const { user, login } = useAuth()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  if (user) return <Navigate to="/dashboard" replace />
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSubmitting(true); setError('')
    try { await login(username, password) } catch (reason) { setError(reason instanceof Error ? reason.message : '登录失败') } finally { setSubmitting(false) }
  }
  return <div className="flex min-h-screen items-center justify-center bg-background px-4"><form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.025] p-8 shadow-2xl"><div className="mb-8 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-400/15 text-teal-300"><LockKeyhole size={22}/></span><h1 className="mt-4 font-display text-2xl font-medium">林中月 · 后台</h1><p className="mt-2 text-sm text-white/40">使用唯一管理员账号登录</p></div><label className="block text-xs text-white/50">用户名<input autoFocus value={username} onChange={e=>setUsername(e.target.value)} className={`${inputCls} mt-2`} autoComplete="username" /></label><label className="mt-4 block text-xs text-white/50">密码<input type="password" value={password} onChange={e=>setPassword(e.target.value)} className={`${inputCls} mt-2`} autoComplete="current-password" /></label>{error && <p className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</p>}<button disabled={submitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-teal-400 py-2.5 text-sm font-medium text-[#08080e] transition hover:bg-teal-300 disabled:opacity-60">{submitting && <LoaderCircle size={15} className="animate-spin"/>}登录</button></form></div>
}

