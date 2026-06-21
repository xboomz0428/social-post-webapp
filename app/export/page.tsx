'use client'

import { useEffect, useState } from 'react'
import { getPosts } from '@/lib/storage'
import type { Post } from '@/lib/types'
import { PLATFORM_LABELS, STATUS_LABELS } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react'

function formatDateRange(posts: Post[]): string {
  if (posts.length === 0) return '無資料'

  const dates = posts
    .map((p) => p.publishedAt ?? p.scheduledAt ?? p.createdAt)
    .filter(Boolean)
    .map((d) => new Date(d as string).getTime())
    .sort((a, b) => a - b)

  if (dates.length === 0) return '無日期資料'

  const fmt = (ts: number) =>
    new Date(ts).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })

  if (dates.length === 1) return fmt(dates[0])
  return `${fmt(dates[0])} ~ ${fmt(dates[dates.length - 1])}`
}

function getStatusBreakdown(posts: Post[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const post of posts) {
    const label = STATUS_LABELS[post.status] ?? post.status
    counts[label] = (counts[label] ?? 0) + 1
  }
  return counts
}

function getPlatformBreakdown(posts: Post[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const post of posts) {
    for (const p of post.platforms) {
      const label = PLATFORM_LABELS[p] ?? p
      counts[label] = (counts[label] ?? 0) + 1
    }
  }
  return counts
}

export default function ExportPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const allPosts = getPosts()
    setPosts(allPosts)
    setLoaded(true)
  }, [])

  async function handleExport() {
    if (posts.length === 0) {
      toast.error('沒有可匯出的貼文')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error ?? `匯出失敗 (${response.status})`)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      a.href = url
      a.download = `social_posts_report_${dateStr}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`已匯出 ${posts.length} 篇貼文報表`)
    } catch (error) {
      const message = error instanceof Error ? error.message : '匯出失敗'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const statusBreakdown = getStatusBreakdown(posts)
  const platformBreakdown = getPlatformBreakdown(posts)

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">匯出報表</h1>
        <p className="text-sm text-muted-foreground mt-1">
          將貼文資料匯出為 CSV 格式，可在 Excel 或 Google Sheets 中開啟
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            匯出摘要
          </CardTitle>
          <CardDescription>
            匯出範圍涵蓋所有儲存的貼文資料
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!loaded ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-muted-foreground">
              目前沒有貼文資料可匯出
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">貼文總數</p>
                  <p className="text-2xl font-bold">{posts.length}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">日期範圍</p>
                  <p className="text-sm font-medium mt-1">
                    {formatDateRange(posts)}
                  </p>
                </div>
              </div>

              {/* Status breakdown */}
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-2">狀態分佈</p>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(statusBreakdown).map(([label, count]) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                    >
                      {label}
                      <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px]">
                        {count}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Platform breakdown */}
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-2">平台分佈</p>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(platformBreakdown).map(([label, count]) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                    >
                      {label}
                      <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px]">
                        {count}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* CSV columns info */}
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  CSV 欄位
                </p>
                <p className="text-xs text-muted-foreground">
                  日期, 標題, 平台, 公式, 狀態, 讚, 留言, 分享, 觸及, 非追蹤者%, 備註
                </p>
              </div>

              {/* Export button */}
              <Button
                onClick={handleExport}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                匯出 CSV 報表
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
