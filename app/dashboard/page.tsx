'use client'
import { useEffect, useState, useMemo } from 'react'
import { getPosts } from '@/lib/storage'
import type { Post, Platform } from '@/lib/types'
import { PLATFORM_LABELS } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, Users, Star } from 'lucide-react'

// ── helpers ────────────────────────────────────────────────────────────

function num(v: number | undefined): number {
  return v ?? 0
}

function pct(v: number): string {
  return `${(v * 100).toFixed(1)}%`
}

function weekKey(d: Date): string {
  const start = new Date(d)
  start.setDate(start.getDate() - start.getDay())
  return `${start.getMonth() + 1}/${start.getDate()}`
}

const PLATFORM_HEX: Record<Platform, string> = {
  facebook: '#2563eb',
  instagram: '#ec4899',
  threads: '#1f2937',
  x: '#6b7280',
}

// ── SVG chart components ────────────────────────────────────────────

function BarChartSVG({ data }: { data: { label: string; value: number }[] }) {
  if (data.length === 0) return <p className="text-sm text-gray-400">暫無資料</p>
  const max = Math.max(...data.map(d => d.value), 1)
  const barW = Math.min(40, 500 / data.length - 8)
  const chartH = 180
  const svgW = data.length * (barW + 12) + 40
  return (
    <svg viewBox={`0 0 ${svgW} ${chartH + 40}`} className="w-full" style={{ maxHeight: 260 }}>
      {data.map((d, i) => {
        const h = (d.value / max) * chartH
        const x = 20 + i * (barW + 12)
        return (
          <g key={i}>
            <rect x={x} y={chartH - h} width={barW} height={h} rx={3} className="fill-blue-500" />
            <text x={x + barW / 2} y={chartH - h - 6} textAnchor="middle" className="fill-gray-600" style={{ fontSize: 10 }}>
              {d.value}
            </text>
            <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" className="fill-gray-500" style={{ fontSize: 9 }}>
              {d.label}
            </text>
          </g>
        )
      })}
      <line x1="16" y1={chartH} x2={svgW} y2={chartH} stroke="#e5e7eb" strokeWidth={1} />
    </svg>
  )
}

function LineChartSVG({ data }: { data: { label: string; value: number }[] }) {
  if (data.length < 2) return <p className="text-sm text-gray-400">至少需要 2 天資料</p>
  const max = Math.max(...data.map(d => d.value), 1)
  const padX = 36
  const padY = 20
  const w = 600
  const h = 200
  const stepX = (w - padX * 2) / (data.length - 1)

  const points = data.map((d, i) => ({
    x: padX + i * stepX,
    y: padY + (1 - d.value / max) * (h - padY * 2),
    ...d,
  }))
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1].x},${h - padY} L${points[0].x},${h - padY} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full" style={{ maxHeight: 280 }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={2} />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} className="fill-blue-500" />
          {i % Math.max(1, Math.floor(data.length / 6)) === 0 && (
            <>
              <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-gray-600" style={{ fontSize: 9 }}>
                {p.value.toLocaleString()}
              </text>
              <text x={p.x} y={h + 12} textAnchor="middle" className="fill-gray-400" style={{ fontSize: 8 }}>
                {p.label}
              </text>
            </>
          )}
        </g>
      ))}
    </svg>
  )
}

function HBarChartSVG({ data }: { data: { label: string; value: number; color: string }[] }) {
  if (data.length === 0) return <p className="text-sm text-gray-400">暫無資料</p>
  const max = Math.max(...data.map(d => d.value), 1)
  const barH = 28
  const gap = 8
  const labelW = 90
  const chartW = 500
  const totalH = data.length * (barH + gap) + 10
  return (
    <svg viewBox={`0 0 ${chartW} ${totalH}`} className="w-full" style={{ maxHeight: 200 }}>
      {data.map((d, i) => {
        const y = i * (barH + gap) + 4
        const w = ((d.value / max) * (chartW - labelW - 60))
        return (
          <g key={i}>
            <text x={0} y={y + barH / 2 + 4} className="fill-gray-700" style={{ fontSize: 12 }}>
              {d.label}
            </text>
            <rect x={labelW} y={y} width={Math.max(w, 2)} height={barH} rx={4} fill={d.color} />
            <text x={labelW + w + 8} y={y + barH / 2 + 4} className="fill-gray-600" style={{ fontSize: 11 }}>
              {d.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── page ────────────────────────────────────────────────────────────

export default function StatsDashboardPage() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    setPosts(getPosts())
  }, [])

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = posts.filter(p => {
      const raw = p.scheduledAt || p.publishedAt || p.createdAt
      if (!raw) return false
      const d = new Date(raw)
      if (isNaN(d.getTime())) return false
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })

    const totalReach = posts.reduce((s, p) => s + num(p.stats.reach), 0)

    const engagementRates = posts
      .filter(p => num(p.stats.reach) > 0)
      .map(p => (num(p.stats.likes) + num(p.stats.comments) + num(p.stats.shares)) / num(p.stats.reach))
    const avgEngagement = engagementRates.length > 0
      ? engagementRates.reduce((s, v) => s + v, 0) / engagementRates.length
      : 0

    const bestPost = [...posts].sort((a, b) => num(b.stats.reach) - num(a.stats.reach))[0] ?? null

    // Weekly bar data (last 8 weeks)
    const eightWeeksAgo = new Date(now)
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)
    const weekMap = new Map<string, number>()
    posts.forEach(p => {
      const raw = p.scheduledAt || p.publishedAt || p.createdAt
      if (!raw) return
      const d = new Date(raw)
      if (isNaN(d.getTime())) return
      if (d >= eightWeeksAgo) {
        const wk = weekKey(d)
        weekMap.set(wk, (weekMap.get(wk) || 0) + 1)
      }
    })
    // Build ordered weeks
    const weeklyData: { label: string; value: number }[] = []
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i * 7)
      const wk = weekKey(d)
      if (!weeklyData.find(w => w.label === wk)) {
        weeklyData.push({ label: wk, value: weekMap.get(wk) || 0 })
      }
    }

    // Reach trend (last 30 days)
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const dayReach = new Map<string, number>()
    posts.forEach(p => {
      const raw = p.scheduledAt || p.publishedAt || p.createdAt
      if (!raw) return
      const d = new Date(raw)
      if (isNaN(d.getTime())) return
      if (d >= thirtyDaysAgo) {
        const key = `${d.getMonth() + 1}/${d.getDate()}`
        dayReach.set(key, (dayReach.get(key) || 0) + num(p.stats.reach))
      }
    })
    const reachTrend: { label: string; value: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = `${d.getMonth() + 1}/${d.getDate()}`
      reachTrend.push({ label: key, value: dayReach.get(key) || 0 })
    }

    // Platform breakdown
    const platCount: Record<Platform, number> = { facebook: 0, instagram: 0, threads: 0, x: 0 }
    posts.forEach(p => {
      p.platforms.forEach(pl => { platCount[pl] = (platCount[pl] || 0) + 1 })
    })
    const platformData = (Object.keys(platCount) as Platform[]).map(pl => ({
      label: PLATFORM_LABELS[pl],
      value: platCount[pl],
      color: PLATFORM_HEX[pl],
    }))

    // Formula performance
    const formulaMap = new Map<string, { reach: number; engagement: number; count: number }>()
    posts.forEach(p => {
      if (!p.formula) return
      const f = formulaMap.get(p.formula) || { reach: 0, engagement: 0, count: 0 }
      f.reach += num(p.stats.reach)
      f.engagement += num(p.stats.likes) + num(p.stats.comments) + num(p.stats.shares)
      f.count += 1
      formulaMap.set(p.formula, f)
    })
    const formulaPerf = Array.from(formulaMap.entries())
      .map(([code, f]) => ({
        code,
        avgReach: f.count > 0 ? Math.round(f.reach / f.count) : 0,
        avgEngagement: f.count > 0 ? Math.round(f.engagement / f.count) : 0,
        count: f.count,
      }))
      .sort((a, b) => b.avgReach - a.avgReach)

    // Top 5
    const top5 = [...posts]
      .sort((a, b) => num(b.stats.reach) - num(a.stats.reach))
      .slice(0, 5)

    return { thisMonthCount: thisMonth.length, totalReach, avgEngagement, bestPost, weeklyData, reachTrend, platformData, formulaPerf, top5 }
  }, [posts])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">數據儀表板</h1>
        <p className="text-gray-500 text-sm mt-1">貼文成效總覽與趨勢分析</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">本月貼文數</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.thisMonthCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">總觸及人數</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.totalReach.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">平均互動率</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{pct(stats.avgEngagement)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">最佳貼文</CardTitle>
            <Star className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold truncate">{stats.bestPost?.title || '—'}</p>
            {stats.bestPost && (
              <p className="text-xs text-gray-400 mt-1">觸及 {num(stats.bestPost.stats.reach).toLocaleString()}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hint when no stats */}
      {stats.totalReach === 0 && posts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <p className="font-medium">觸及 / 互動數據尚未填入</p>
          <p className="text-amber-600 mt-1">
            目前平台 API 不會自動回傳成效數據。你可以在編輯貼文時手動填入讚數、留言、觸及等資訊，儀表板就會顯示分析圖表。
          </p>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">每週發文數（近 8 週）</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartSVG data={stats.weeklyData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">觸及趨勢（近 30 天）</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartSVG data={stats.reachTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">平台分佈</CardTitle>
          </CardHeader>
          <CardContent>
            <HBarChartSVG data={stats.platformData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">公式表現</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.formulaPerf.length === 0 ? (
              <p className="text-sm text-gray-400">暫無公式數據</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>公式</TableHead>
                      <TableHead className="text-right">篇數</TableHead>
                      <TableHead className="text-right">平均觸及</TableHead>
                      <TableHead className="text-right">平均互動</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.formulaPerf.map(f => (
                      <TableRow key={f.code}>
                        <TableCell>
                          <Badge variant="outline">{f.code}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{f.count}</TableCell>
                        <TableCell className="text-right">{f.avgReach.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{f.avgEngagement.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top posts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">觸及排名 Top 5</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.top5.length === 0 ? (
            <p className="text-sm text-gray-400">暫無貼文</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>標題</TableHead>
                    <TableHead>平台</TableHead>
                    <TableHead>公式</TableHead>
                    <TableHead className="text-right">觸及</TableHead>
                    <TableHead className="text-right">讚</TableHead>
                    <TableHead className="text-right">留言</TableHead>
                    <TableHead className="text-right">分享</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.top5.map((p, i) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{i + 1}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{p.title || '（無標題）'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {p.platforms.map(pl => (
                            <span key={pl} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: PLATFORM_HEX[pl] + '20', color: PLATFORM_HEX[pl] }}>
                              {PLATFORM_LABELS[pl]}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{p.formula || '—'}</Badge></TableCell>
                      <TableCell className="text-right font-medium">{num(p.stats.reach).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{num(p.stats.likes).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{num(p.stats.comments).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{num(p.stats.shares).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
