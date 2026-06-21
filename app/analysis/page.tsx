'use client'
import { useEffect, useState } from 'react'
import { getPosts, getAIConfig } from '@/lib/storage'
import type { Post, AIConfig } from '@/lib/types'
import { AI_PROVIDER_LABELS } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Brain, Lightbulb, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

interface Recommendation {
  formula: string
  weight: number
}

function WeightBarChart({ data }: { data: Recommendation[] }) {
  if (data.length === 0) return null
  const sorted = [...data].sort((a, b) => b.weight - a.weight)
  const max = Math.max(...sorted.map(d => d.weight), 0.01)
  const barH = 32
  const gap = 6
  const labelW = 60
  const chartW = 500
  const valueW = 60
  const totalH = sorted.length * (barH + gap) + 10

  const colors = [
    '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
    '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316',
  ]

  return (
    <svg viewBox={`0 0 ${chartW} ${totalH}`} className="w-full" style={{ maxHeight: Math.max(totalH, 100) }}>
      {sorted.map((d, i) => {
        const y = i * (barH + gap) + 4
        const w = (d.weight / max) * (chartW - labelW - valueW - 20)
        return (
          <g key={d.formula}>
            <text x={0} y={y + barH / 2 + 5} style={{ fontSize: 13, fontWeight: 600 }} className="fill-gray-700">
              {d.formula}
            </text>
            <rect x={labelW} y={y} width={Math.max(w, 4)} height={barH} rx={4} fill={colors[i % colors.length]} />
            <text x={labelW + w + 8} y={y + barH / 2 + 5} style={{ fontSize: 12 }} className="fill-gray-600">
              {(d.weight * 100).toFixed(0)}%
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function AnalysisPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [aiConfig, setAIConfig] = useState<AIConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [showApply, setShowApply] = useState(false)

  useEffect(() => {
    setPosts(getPosts())
    setAIConfig(getAIConfig())
  }, [])

  const publishedPosts = posts.filter(p => p.status === 'published' && p.stats && (p.stats.reach || p.stats.likes))

  async function runAnalysis() {
    if (!aiConfig) {
      toast.error('請先到設定頁面配置 AI')
      return
    }

    const provider = aiConfig.activeProvider
    const cfg = aiConfig[provider]
    if (!cfg.apiKey) {
      toast.error(`請先設定 ${AI_PROVIDER_LABELS[provider]} 的 API Key`)
      return
    }

    setLoading(true)
    setAnalysis(null)
    setRecommendations([])
    setShowApply(false)

    try {
      const payload = publishedPosts.map(p => ({
        content: p.contentText || p.content,
        formula: p.formula,
        stats: {
          likes: p.stats.likes ?? 0,
          comments: p.stats.comments ?? 0,
          shares: p.stats.shares ?? 0,
          reach: p.stats.reach ?? 0,
        },
      }))

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: cfg.apiKey,
          model: cfg.model,
          posts: payload,
        }),
      })

      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        setAnalysis(data.analysis)
        setRecommendations(data.recommendations || [])
        toast.success('分析完成')
      }
    } catch {
      toast.error('分析請求失敗')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI 內容分析</h1>
        <p className="text-gray-500 text-sm mt-1">
          用 AI 分析歷史貼文成效，找出最佳公式與內容策略
        </p>
      </div>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5" />
            分析設定
          </CardTitle>
          <CardDescription>
            將已發佈且有成效數據的貼文送交 AI 分析
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">可分析貼文：</span>
            <Badge variant="outline">{publishedPosts.length} 篇</Badge>
            {aiConfig && (
              <>
                <span className="text-gray-500">AI 提供者：</span>
                <Badge>{AI_PROVIDER_LABELS[aiConfig.activeProvider]}</Badge>
              </>
            )}
          </div>

          {publishedPosts.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              目前沒有已發佈且有成效數據的貼文。請先發佈貼文並填寫觸及、讚、留言等數據後再進行分析。
            </div>
          )}

          <Button
            onClick={runAnalysis}
            disabled={loading || publishedPosts.length === 0}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            {loading ? '分析中...' : '開始 AI 分析'}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Result */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              分析結果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {analysis.split('\n').map((line, i) => {
                if (line.startsWith('## ') || line.startsWith('**')) {
                  return <p key={i} className="font-semibold mt-3 mb-1">{line.replace(/[#*]+/g, '').trim()}</p>
                }
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  return <p key={i} className="ml-4 text-gray-700">{line}</p>
                }
                if (line.trim() === '') return <br key={i} />
                return <p key={i} className="text-gray-700 leading-relaxed">{line}</p>
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations chart */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              公式權重建議
            </CardTitle>
            <CardDescription>
              AI 建議的公式分配比例（14 天排程）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <WeightBarChart data={recommendations} />

            <div className="flex flex-wrap gap-2">
              {recommendations.map(r => (
                <Badge key={r.formula} variant="outline" className="text-sm">
                  {r.formula}: {(r.weight * 100).toFixed(0)}%
                </Badge>
              ))}
            </div>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowApply(true)}
            >
              套用建議到下一輪排程
            </Button>

            {showApply && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 space-y-2">
                <p className="font-semibold">建議公式分配如下：</p>
                <ul className="list-disc list-inside space-y-1">
                  {recommendations.map(r => {
                    const count = Math.max(1, Math.round(r.weight * 14))
                    return (
                      <li key={r.formula}>
                        {r.formula}：約 {count} 篇 / 14 天（{(r.weight * 100).toFixed(0)}%）
                      </li>
                    )
                  })}
                </ul>
                <p className="text-xs text-blue-600 mt-2">
                  此功能尚在開發中，目前僅顯示建議。未來將可直接套用到排程。
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
