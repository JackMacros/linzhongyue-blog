import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { LayoutDashboard, FileText, Tags, Library, ScrollText, UserCircle, Images, PanelsTopLeft, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'

const MENU = [
  { label: '仪表盘', icon: LayoutDashboard, path: '/dashboard' },
  { label: '文章管理', icon: FileText, path: '/content/posts' },
  { label: '标签管理', icon: Tags, path: '/content/tags' },
  { label: '专栏管理', icon: Library, path: '/content/columns' },
  { label: '站点内容', icon: PanelsTopLeft, path: '/content/site' },
  { label: '图片素材', icon: Images, path: '/content/media' },
  { label: '操作日志', icon: ScrollText, path: '/system/logs/operation' },
  { label: '个人中心', icon: UserCircle, path: '/profile' },
]

const TITLES = Object.fromEntries(MENU.map(item => [item.path, item.label]))

function Sidebar({ close }: { close: () => void }) {
  const { user, logout } = useAuth()
  return <div className="flex h-full flex-col bg-[#0c0c14]">
    <NavLink to="/dashboard" onClick={close} className="flex items-center gap-2.5 border-b border-white/[0.06] px-5 py-5"><img src="/site-icon.svg" alt="" className="h-8 w-8"/><span className="font-display text-base font-medium tracking-tight">林中月 · 后台</span></NavLink>
    <nav className="flex-1 overflow-y-auto py-3">{MENU.map(item => { const Icon=item.icon; return <NavLink key={item.path} to={item.path} onClick={close} className={({isActive})=>`flex items-center gap-3 border-l-2 px-5 py-3 text-sm transition-colors ${isActive?'border-teal-400 bg-teal-400/10 text-teal-300':'border-transparent text-white/60 hover:bg-white/[0.04] hover:text-white/90'}`}><Icon size={16}/>{item.label}</NavLink> })}</nav>
    <div className="border-t border-white/[0.06] p-4"><div className="mb-3 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-400/30 to-violet-400/30 text-sm">{user?.avatarUrl?<img src={user.avatarUrl} className="h-full w-full object-cover"/>:user?.nickname?.slice(0,1) || '管'}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{user?.nickname}</p><p className="truncate text-[10px] text-white/40">@{user?.username}</p></div></div><button onClick={()=>logout()} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2 text-xs text-white/55 transition hover:border-red-400/30 hover:text-red-300"><LogOut size={14}/>退出登录</button></div>
  </div>
}

export default function AdminLayout() {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const title = pathname === '/content/posts/new' ? '写文章' : /^\/content\/posts\/\d+\/edit$/.test(pathname) ? '编辑文章' : TITLES[pathname] ?? '后台管理'
  return <div className="flex min-h-screen bg-background">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-white/[0.06] lg:block"><Sidebar close={()=>undefined}/></aside>
    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="关闭菜单" className="absolute inset-0 bg-black/60" onClick={()=>setMobileOpen(false)}/><aside className="relative h-full w-72 border-r border-white/10"><button aria-label="关闭菜单" onClick={()=>setMobileOpen(false)} className="absolute right-3 top-4 z-10 p-2 text-white/50"><X size={18}/></button><Sidebar close={()=>setMobileOpen(false)}/></aside></div>}
    <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-60"><header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/[0.06] bg-[#0a0a10]/80 px-4 py-3.5 backdrop-blur-md md:px-6"><button aria-label="打开菜单" onClick={()=>setMobileOpen(true)} className="rounded-md p-2 text-white/60 hover:bg-white/[0.06] lg:hidden"><Menu size={19}/></button><h1 className="font-display text-lg font-medium">{title}</h1></header><main className="min-w-0 flex-1 p-4 md:p-6"><Outlet/></main></div>
  </div>
}
