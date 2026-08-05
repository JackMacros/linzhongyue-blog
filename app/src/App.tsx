import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router'
import { useAuth } from '@/auth/AuthContext'
import { GlobalLoading, PageLoading } from '@/components/Loading'

const AdminLayout = lazy(() => import('@/layouts/AdminLayout'))
const Login = lazy(() => import('@/pages/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Posts = lazy(() => import('@/pages/content/Posts'))
const ArticleEditor = lazy(() => import('@/pages/content/ArticleEditor'))
const Tags = lazy(() => import('@/pages/content/Tags'))
const ColumnsAdmin = lazy(() => import('@/pages/content/ColumnsAdmin'))
const SiteContent = lazy(() => import('@/pages/content/SiteContent'))
const Media = lazy(() => import('@/pages/content/Media'))
const LogsOperation = lazy(() => import('@/pages/system/LogsOperation'))
const Profile = lazy(() => import('@/pages/Profile'))

function Protected() {
  const { user, loading } = useAuth()
  if (loading) return <PageLoading label="正在验证登录状态" />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export default function App() {
  return <><GlobalLoading /><Suspense fallback={<PageLoading />}><Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<Protected />}><Route element={<AdminLayout />}>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/content/posts" element={<Posts />} />
      <Route path="/content/posts/new" element={<ArticleEditor />} />
      <Route path="/content/posts/:id/edit" element={<ArticleEditor />} />
      <Route path="/content/tags" element={<Tags />} />
      <Route path="/content/columns" element={<ColumnsAdmin />} />
      <Route path="/content/site" element={<SiteContent />} />
      <Route path="/content/media" element={<Media />} />
      <Route path="/system/logs/operation" element={<LogsOperation />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Route></Route>
  </Routes></Suspense></>
}
