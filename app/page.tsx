'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getPosts, deletePost } from '@/lib/storage'
import { Post, PLATFORM_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PenSquare, Trash2, Eye, Plus, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { toast } from 'sonner'

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    setPosts(getPosts().sort((a, b) => {
      if (a.scheduledAt && b.scheduledAt) return a.scheduledAt.localeCompare(b.scheduledAt)
      if (a.scheduledAt) return -1
      if (b.scheduledAt) return 1
      return b.createdAt.localeCompare(a.createdAt)
    }))
  }, [])

  function handleDelete(id: string) {
    if (!confirm('確定要刪除這篇貼文？')) return
    deletePost(id)
    setPosts(p => p.filter(post => post.id !== id))
    toast.success('已刪除')
  }

  const scheduled = posts.filter(p => p.status === 'scheduled')
  const drafts = posts.filter(p => p.status === 'draft')
  const published = posts.filter(p => p.status === 'published')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">排程總覽</h1>
          <p className="text-gray-500 text-sm mt-1">管理你的社群貼文排程</p>
        </div>
        <Link href="/editor">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            新增貼文
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '已排程', count: scheduled.length, color: 'text-blue-600' },
          { label: '草稿', count: drafts.length, color: 'text-gray-600' },
          { label: '已發佈', count: published.length, color: 'text-green-600' },
        ].map(({ label, count, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3">
              <div className={`text-3xl font-bold ${color}`}>{count}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schedule Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            所有貼文
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {posts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>還沒有貼文</p>
              <Link href="/editor">
                <Button variant="link" className="mt-2">新增第一篇</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {posts.map(post => (
                <div key={post.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50">
                  {/* Date column */}
                  <div className="w-24 shrink-0 text-sm">
                    {post.scheduledAt ? (
                      <div>
                        <div className="font-medium">
                          {format(parseISO(post.scheduledAt), 'MM/dd', { locale: zhTW })}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {format(parseISO(post.scheduledAt), 'HH:mm')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">未排程</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {post.formula && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-mono">
                          {post.formula}
                        </span>
                      )}
                      {post.dayNumber > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          Day {post.dayNumber}
                        </span>
                      )}
                      <Badge className={`text-xs ${STATUS_COLORS[post.status]}`} variant="outline">
                        {STATUS_LABELS[post.status]}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium truncate">
                      {post.title || post.contentText?.slice(0, 60) || '（無標題）'}
                    </p>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {post.platforms.map(p => (
                        <span key={p} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {PLATFORM_LABELS[p]}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  {post.status === 'published' && (post.stats.likes || post.stats.comments) ? (
                    <div className="text-xs text-gray-500 text-right shrink-0">
                      <div>❤️ {post.stats.likes ?? '-'}</div>
                      <div>💬 {post.stats.comments ?? '-'}</div>
                      <div>🔗 {post.stats.shares ?? '-'}</div>
                    </div>
                  ) : null}

                  {/* Actions */}
                  <div className="flex gap-1 shrink-0">
                    <Link href={`/editor/${post.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <PenSquare className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
