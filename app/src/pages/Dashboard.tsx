import { useEffect, useState } from 'react'
import { FileText, Eye, Tags, Library } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, Badge } from '@/components/admin'
import { apiRequest, formatDateTime } from '@/api/client'
import type { DashboardView } from '@/api/types'

export default function Dashboard() {
  const [data, setData] = useState<DashboardView | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { apiRequest<DashboardView>('/api/admin/dashboard/summary').then(setData).catch(reason => setError(reason.message)) }, [])
  const stats = [
    { label:'文章总数', value:data?.articleCount ?? '—', note:`${data?.publishedCount ?? 0} 已发布 / ${data?.draftCount ?? 0} 草稿`, icon:FileText },
    { label:'总浏览量', value:data?.totalViews?.toLocaleString() ?? '—', note:'文章累计浏览', icon:Eye },
    { label:'标签数', value:data?.tagCount ?? '—', note:'用于文章筛选', icon:Tags },
    { label:'专栏数', value:data?.columnCount ?? '—', note:'系列专题', icon:Library },
  ]
  if (error) return <Card className="p-6 text-red-300">{error}</Card>
  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(item=><Card key={item.label} className="p-5"><div className="flex items-center justify-between"><p className="text-sm text-white/50">{item.label}</p><span className="rounded-lg bg-teal-400/10 p-2 text-teal-300"><item.icon size={16}/></span></div><p className="mt-3 font-display text-3xl font-medium">{item.value}</p><p className="mt-1.5 text-xs text-white/35">{item.note}</p></Card>)}</div>
    <Card className="p-5"><div className="mb-4 flex items-center justify-between"><h3 className="font-display text-base font-medium">访问趋势</h3><Badge tone="gray">近 7 天</Badge></div><ResponsiveContainer width="100%" height={280}><AreaChart data={data?.visitTrend ?? []} margin={{top:5,right:8,left:-18,bottom:0}}><defs><linearGradient id="pv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2dd4bf" stopOpacity={.35}/><stop offset="100%" stopColor="#2dd4bf" stopOpacity={0}/></linearGradient><linearGradient id="uv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity={.3}/><stop offset="100%" stopColor="#a78bfa" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false}/><XAxis dataKey="date" tick={{fill:'rgba(255,255,255,.4)',fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:'rgba(255,255,255,.4)',fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:'#12121c',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,fontSize:12}}/><Area type="monotone" dataKey="pv" name="浏览量" stroke="#2dd4bf" strokeWidth={2} fill="url(#pv)"/><Area type="monotone" dataKey="uv" name="访客数" stroke="#a78bfa" strokeWidth={2} fill="url(#uv)"/></AreaChart></ResponsiveContainer></Card>
    <div className="grid gap-6 xl:grid-cols-2"><Card className="p-5"><h3 className="mb-4 font-display text-base font-medium">热门文章 TOP 5</h3><div className="space-y-3">{(data?.topArticles ?? []).map((article,index)=><div key={article.id} className="flex items-center gap-3"><span className={`flex h-6 w-6 items-center justify-center rounded-md font-mono2 text-[11px] ${index<3?'bg-teal-400/15 text-teal-300':'bg-white/[.05] text-white/40'}`}>{index+1}</span><span className="flex-1 truncate text-sm text-white/75">{article.title}</span><span className="font-mono2 text-xs text-white/40">{article.views.toLocaleString()}</span></div>)}</div></Card><Card className="p-5"><h3 className="mb-4 font-display text-base font-medium">最新草稿</h3><div className="space-y-3">{(data?.latestDrafts ?? []).map(draft=><div key={draft.id} className="flex items-center gap-3 rounded-lg border border-white/[.06] px-4 py-3"><div className="flex-1"><p className="truncate text-sm text-white/80">{draft.title}</p><p className="mt-1 text-xs text-white/40">{formatDateTime(draft.updatedAt)}</p></div><Badge tone="amber">草稿</Badge></div>)}{data && data.latestDrafts.length===0 && <p className="py-6 text-center text-sm text-white/35">暂无草稿</p>}</div></Card></div>
  </div>
}
