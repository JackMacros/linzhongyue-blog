import { useEffect, useRef, useState } from 'react'
import { Trash2, Upload } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { apiRequest, formatDateTime, jsonBody } from '@/api/client'
import type { MediaAsset } from '@/api/types'
import { Badge, Btn, Card, Field, inputCls } from '@/components/admin'

export default function Profile() {
  const { user, refresh } = useAuth()
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const avatarInput = useRef<HTMLInputElement>(null)

  useEffect(() => { setNickname(user?.nickname ?? ''); setEmail(user?.email ?? ''); setAvatarUrl(user?.avatarUrl ?? '') }, [user])

  const save = async (nextAvatar = avatarUrl) => {
    try {
      await apiRequest('/api/auth/profile', { method: 'PUT', ...jsonBody({ nickname, email, avatarUrl: nextAvatar }) })
      await refresh()
      setAvatarUrl(nextAvatar)
      setMessage('资料已保存，公开站点头像已同步')
      setError('')
    } catch (reason) { setError((reason as Error).message) }
  }

  const uploadAvatar = async (file?: File) => {
    if (!file) return
    setUploading(true); setError('')
    const data = new FormData(); data.append('file', file)
    try {
      const asset = await apiRequest<MediaAsset>('/api/admin/media/images', { method: 'POST', body: data })
      await save(asset.url)
    } catch (reason) { setError((reason as Error).message) }
    finally { setUploading(false); if (avatarInput.current) avatarInput.current.value = '' }
  }

  const password = async () => {
    try {
      await apiRequest('/api/auth/password', { method: 'PUT', ...jsonBody({ currentPassword, newPassword, confirmPassword }) })
      setMessage('密码已修改，请重新登录'); setError('')
    } catch (reason) { setError((reason as Error).message) }
  }

  return <div className="grid max-w-4xl gap-6 lg:grid-cols-[280px_1fr]">
    <Card className="h-fit p-6 text-center">
      <button onClick={() => avatarInput.current?.click()} className="group relative mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-400/30 to-violet-400/30 font-display text-3xl">{avatarUrl ? <img src={avatarUrl} className="h-full w-full object-cover" /> : user?.nickname.slice(0, 1)}<span className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs opacity-0 transition-opacity group-hover:opacity-100"><Upload size={15} className="mr-1" />更换头像</span></button>
      <input ref={avatarInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={event => uploadAvatar(event.target.files?.[0])} />
      <p className="mt-4 font-display text-lg">{user?.nickname}</p><p className="mt-1 font-mono2 text-xs text-white/40">@{user?.username}</p><div className="mt-3"><Badge tone="violet">唯一管理员</Badge></div>
      <div className="mt-5 flex justify-center gap-2"><Btn onClick={() => avatarInput.current?.click()} className="flex items-center gap-1.5"><Upload size={14} />{uploading ? '上传中…' : '上传头像'}</Btn>{avatarUrl && <Btn variant="danger" onClick={() => save('')} className="flex items-center gap-1.5"><Trash2 size={14} />移除</Btn>}</div>
      <p className="mt-3 text-[11px] leading-relaxed text-white/35">JPG、PNG 或 WebP，最大 10MB<br />上传后同步用于“关于我”页面</p>
      <div className="mt-6 space-y-2 border-t border-white/[.07] pt-5 text-left text-xs text-white/50"><p>创建时间：{formatDateTime(user?.createdAt)}</p><p>最后登录：{formatDateTime(user?.lastLoginAt)}</p></div>
    </Card>
    <Card className="p-6">
      {error && <p className="mb-4 rounded-lg bg-red-400/10 p-3 text-sm text-red-300">{error}</p>}{message && <p className="mb-4 rounded-lg bg-teal-400/10 p-3 text-sm text-teal-300">{message}</p>}
      <h3 className="mb-5 font-display">基本资料</h3><div className="space-y-4"><Field label="昵称"><input value={nickname} onChange={event => setNickname(event.target.value)} className={inputCls} /></Field><Field label="邮箱"><input value={email} onChange={event => setEmail(event.target.value)} className={inputCls} /></Field><Btn variant="primary" onClick={() => save()}>保存修改</Btn></div>
      <h3 className="mb-5 mt-10 font-display">修改密码</h3><div className="grid gap-4 md:grid-cols-3"><Field label="当前密码"><input type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} className={inputCls} /></Field><Field label="新密码"><input type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} className={inputCls} /></Field><Field label="确认新密码"><input type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className={inputCls} /></Field></div><div className="pt-4"><Btn onClick={password}>更新密码</Btn></div>
    </Card>
  </div>
}
