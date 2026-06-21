'use client'

import { useEffect, useState, useCallback } from 'react'
import type {
  Post,
  Platform,
  AIProvider,
  AIConfig,
  SocialAccount,
  StyleProfile,
} from '@/lib/types'
import {
  AI_PROVIDER_LABELS,
  AI_MODELS,
  PLATFORM_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
} from '@/lib/types'
import {
  getAccounts,
  getAIConfig,
  getStyleProfile,
  createPost,
  savePost,
} from '@/lib/storage'
import { FORMULA_TEMPLATES } from '@/lib/formulas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sparkles,
  Loader2,
  Save,
  Calendar,
  Trash2,
  RefreshCw,
  CalendarCheck,
  PenSquare,
} from 'lucide-react'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'
import { zhTW } from 'date-fns/locale'

// ── Types ────────────────────────────────────────────────────────────

interface BatchPost extends Post {
  /** Index in the batch for tracking */
  batchIndex: number
  /** Whether this row is currently generating */
  generating: boolean
  /** Error message if generation failed */
  error?: string
}

type BatchStatus = 'idle' | 'generating' | 'done'

// ── Helpers ──────────────────────────────────────────────────────────

const ALL_PLATFORMS: Platform[] = ['facebook', 'instagram', 'threads', 'x']

function distributeFormulas(
  totalPosts: number,
  platforms: Platform[],
): string[] {
  // Filter formulas matching any of the selected platforms
  const eligible = FORMULA_TEMPLATES.filter(
    (f) =>
      platforms.length === 0 ||
      f.targetPlatforms.some((tp) => platforms.includes(tp as Platform)),
  )
  if (eligible.length === 0) return Array(totalPosts).fill('')

  const codes: string[] = []
  for (let i = 0; i < totalPosts; i++) {
    codes.push(eligible[i % eligible.length].code)
  }
  return codes
}

function computePostDates(
  startDate: string,
  days: number,
  postsPerWeek: number,
  activeDays: number[],
  preferredTimes: string[],
): { date: Date; timeSlot: string }[] {
  const results: { date: Date; timeSlot: string }[] = []
  const start = new Date(startDate)
  let currentDay = 0
  let postsThisWeek = 0
  let weekStart = 0

  for (let d = 0; d < days * 2 && results.length < days; d++) {
    const candidate = addDays(start, d)
    const dayOfWeek = candidate.getDay()

    // Reset weekly counter
    if (d > 0 && dayOfWeek === 0) {
      postsThisWeek = 0
      weekStart = d
    }

    // Skip if day not active or weekly quota reached
    if (
      activeDays.length > 0 &&
      !activeDays.includes(dayOfWeek)
    ) {
      continue
    }
    if (postsPerWeek > 0 && postsThisWeek >= postsPerWeek) {
      continue
    }

    const timeSlot =
      preferredTimes.length > 0
        ? preferredTimes[results.length % preferredTimes.length]
        : '09:00'

    results.push({ date: candidate, timeSlot })
    postsThisWeek++
    currentDay++
  }

  return results.slice(0, days)
}

// ── Component ────────────────────────────────────────────────────────

export default function BatchSchedulePage() {
  // Account & config state
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null)

  // Generation params
  const [startDate, setStartDate] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  )
  const [numDays, setNumDays] = useState(14)
  const [postsPerWeek, setPostsPerWeek] = useState(3)
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    'facebook',
    'threads',
  ])
  const [aiProvider, setAiProvider] = useState<AIProvider>('google')
  const [aiModel, setAiModel] = useState('')
  const [topic, setTopic] = useState('')
  const [autoFormula, setAutoFormula] = useState(true)

  // Batch state
  const [batchPosts, setBatchPosts] = useState<BatchPost[]>([])
  const [batchStatus, setBatchStatus] = useState<BatchStatus>('idle')
  const [generatingIndex, setGeneratingIndex] = useState(-1)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')

  // Init
  useEffect(() => {
    const accs = getAccounts()
    setAccounts(accs)

    const cfg = getAIConfig()
    setAiConfig(cfg)
    setAiProvider(cfg.activeProvider)
    setAiModel(cfg[cfg.activeProvider].model)

    if (accs.length > 0) {
      setSelectedAccountId(accs[0].id)
      setPostsPerWeek(accs[0].scheduleRules.postsPerWeek)
    }
  }, [])

  // Update model when provider changes
  useEffect(() => {
    if (!aiConfig) return
    setAiModel(aiConfig[aiProvider].model)
  }, [aiProvider, aiConfig])

  // Update postsPerWeek when account changes
  useEffect(() => {
    const acc = accounts.find((a) => a.id === selectedAccountId)
    if (acc) {
      setPostsPerWeek(acc.scheduleRules.postsPerWeek)
    }
  }, [selectedAccountId, accounts])

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId)

  // ── Platform toggle ──────────────────────────────────────────────

  function togglePlatform(platform: Platform) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    )
  }

  // ── Generate a single post ───────────────────────────────────────

  async function generateSinglePost(
    index: number,
    formula: string,
    dayNum: number,
    scheduledDate: Date,
    timeSlot: string,
    previousTopics: string[],
  ): Promise<BatchPost> {
    if (!aiConfig || !selectedAccount) {
      throw new Error('AI 設定或帳號未選擇')
    }

    const providerCfg = aiConfig[aiProvider]
    if (!providerCfg.apiKey) {
      throw new Error('請先到設定頁面設定 AI API Key')
    }

    // Get style profile
    let styleProfile: StyleProfile | null = null
    if (selectedAccount.styleProfileId || selectedAccountId) {
      styleProfile = getStyleProfile(selectedAccountId)
    }

    // Build the formula object
    const formulaObj = FORMULA_TEMPLATES.find((f) => f.code === formula)

    // Build the prompt with context
    const contextParts: string[] = []
    if (topic.trim()) {
      contextParts.push(`主題方向：${topic.trim()}`)
    }
    contextParts.push(
      `這是 ${numDays} 天內容策略的第 ${dayNum} 天。`,
    )
    if (previousTopics.length > 0) {
      contextParts.push(
        `前幾天的主題：${previousTopics.join('、')}。請避免重複，嘗試不同角度。`,
      )
    }
    contextParts.push(
      `排程日期：${format(scheduledDate, 'yyyy/MM/dd (EEEE)', { locale: zhTW })}`,
    )
    if (formulaObj) {
      contextParts.push(
        `請使用公式「${formulaObj.name}」的結構撰寫。`,
      )
    }

    const prompt = contextParts.join('\n')

    const targetPlatform = selectedPlatforms[0] || 'facebook'

    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: aiProvider,
        apiKey: providerCfg.apiKey,
        model: aiModel || providerCfg.model,
        temperature: providerCfg.temperature,
        prompt,
        styleProfile: styleProfile
          ? {
              toneSummary: styleProfile.toneSummary,
              samplePosts: styleProfile.samplePosts,
              targetAudience: styleProfile.targetAudience,
              customInstructions: styleProfile.customInstructions,
            }
          : undefined,
        formula: formulaObj
          ? {
              name: formulaObj.name,
              skeleton: formulaObj.skeleton,
              description: formulaObj.description,
            }
          : undefined,
        platform: targetPlatform,
        accountName:
          selectedAccount.displayName || selectedAccount.accountName,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: '生成失敗' }))
      throw new Error(err.error || `HTTP ${res.status}`)
    }

    const data = await res.json()
    const content = data.content || ''

    // Build scheduled datetime
    const [hours, minutes] = timeSlot.split(':').map(Number)
    const scheduledAt = new Date(scheduledDate)
    scheduledAt.setHours(hours, minutes, 0, 0)

    // Extract a title from the first line
    const firstLine = content.split('\n')[0] || ''
    const title =
      firstLine.length > 50 ? firstLine.slice(0, 50) + '...' : firstLine

    const post = createPost({
      accountId: selectedAccountId,
      title,
      content,
      contentText: content,
      platforms: [...selectedPlatforms],
      scheduledAt: scheduledAt.toISOString(),
      status: 'draft',
      formula: formula,
      dayNumber: dayNum,
      aiGenerated: true,
      aiProvider,
    })

    return {
      ...post,
      batchIndex: index,
      generating: false,
    }
  }

  // ── Generate all posts ───────────────────────────────────────────

  async function handleBatchGenerate() {
    if (!selectedAccountId) {
      toast.error('請先選擇帳號')
      return
    }
    if (!aiConfig) {
      toast.error('AI 設定未載入')
      return
    }
    const providerCfg = aiConfig[aiProvider]
    if (!providerCfg.apiKey) {
      toast.error('請先到設定頁面設定 AI API Key')
      return
    }
    if (!topic.trim()) {
      toast.error('請輸入主題/方向')
      return
    }

    setBatchStatus('generating')
    setBatchPosts([])

    const account = accounts.find((a) => a.id === selectedAccountId)
    if (!account) return

    // Compute dates
    const dates = computePostDates(
      startDate,
      numDays,
      postsPerWeek,
      account.scheduleRules.activeDays,
      account.scheduleRules.preferredTimes,
    )

    const totalPosts = dates.length
    const formulas = autoFormula
      ? distributeFormulas(totalPosts, selectedPlatforms)
      : Array(totalPosts).fill('')

    // Initialize placeholder rows
    const placeholders: BatchPost[] = dates.map((d, i) => ({
      ...createPost({
        accountId: selectedAccountId,
        platforms: [...selectedPlatforms],
        formula: formulas[i],
        dayNumber: i + 1,
      }),
      batchIndex: i,
      generating: true,
    }))
    setBatchPosts(placeholders)

    // Generate sequentially to maintain context
    const generated: BatchPost[] = []
    const previousTopics: string[] = []

    for (let i = 0; i < totalPosts; i++) {
      setGeneratingIndex(i)
      try {
        const post = await generateSinglePost(
          i,
          formulas[i],
          i + 1,
          dates[i].date,
          dates[i].timeSlot,
          previousTopics,
        )
        generated.push(post)
        previousTopics.push(
          post.title.slice(0, 30),
        )

        // Update the batch list progressively
        setBatchPosts((prev) => {
          const next = [...prev]
          next[i] = post
          return next
        })
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : '生成失敗'
        generated.push({
          ...placeholders[i],
          generating: false,
          error: errorMsg,
        })
        setBatchPosts((prev) => {
          const next = [...prev]
          next[i] = {
            ...prev[i],
            generating: false,
            error: errorMsg,
          }
          return next
        })
      }
    }

    setGeneratingIndex(-1)
    setBatchStatus('done')
    toast.success(`已生成 ${generated.filter((p) => !p.error).length} / ${totalPosts} 篇貼文`)
  }

  // ── Row actions ──────────────────────────────────────────────────

  function handleDelete(index: number) {
    setBatchPosts((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleRegenerate(index: number) {
    const post = batchPosts[index]
    if (!post) return

    setBatchPosts((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], generating: true, error: undefined }
      return next
    })

    const account = accounts.find((a) => a.id === selectedAccountId)
    if (!account) return

    const previousTopics = batchPosts
      .slice(0, index)
      .filter((p) => !p.error)
      .map((p) => p.title.slice(0, 30))

    const dates = computePostDates(
      startDate,
      numDays,
      postsPerWeek,
      account.scheduleRules.activeDays,
      account.scheduleRules.preferredTimes,
    )

    const dateInfo = dates[index] || {
      date: addDays(new Date(startDate), index),
      timeSlot: '09:00',
    }

    try {
      const newPost = await generateSinglePost(
        index,
        post.formula,
        post.dayNumber,
        dateInfo.date,
        dateInfo.timeSlot,
        previousTopics,
      )
      setBatchPosts((prev) => {
        const next = [...prev]
        next[index] = newPost
        return next
      })
      toast.success(`第 ${index + 1} 篇重新生成完成`)
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : '重新生成失敗'
      setBatchPosts((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], generating: false, error: errorMsg }
        return next
      })
      toast.error(errorMsg)
    }
  }

  function handleStartEdit(index: number) {
    setEditingIndex(index)
    setEditContent(batchPosts[index].contentText)
  }

  function handleSaveEdit() {
    if (editingIndex === null) return
    setBatchPosts((prev) => {
      const next = [...prev]
      const firstLine = editContent.split('\n')[0] || ''
      next[editingIndex] = {
        ...next[editingIndex],
        content: editContent,
        contentText: editContent,
        title:
          firstLine.length > 50
            ? firstLine.slice(0, 50) + '...'
            : firstLine,
      }
      return next
    })
    setEditingIndex(null)
    setEditContent('')
    toast.success('已更新')
  }

  // ── Save all / Schedule all ──────────────────────────────────────

  function handleSaveAll() {
    const valid = batchPosts.filter((p) => !p.error && !p.generating)
    if (valid.length === 0) {
      toast.error('沒有可儲存的貼文')
      return
    }

    for (const bp of valid) {
      const { batchIndex, generating, error, ...postData } = bp
      savePost(postData)
    }

    toast.success(`已儲存 ${valid.length} 篇貼文到本機`)
  }

  function handleScheduleAll() {
    const valid = batchPosts.filter((p) => !p.error && !p.generating)
    if (valid.length === 0) {
      toast.error('沒有可排程的貼文')
      return
    }

    const updated = batchPosts.map((bp) => {
      if (bp.error || bp.generating) return bp
      return { ...bp, status: 'scheduled' as const }
    })
    setBatchPosts(updated)

    for (const bp of updated) {
      if (bp.error || bp.generating) continue
      const { batchIndex, generating, error, ...postData } = bp
      savePost({ ...postData, status: 'scheduled' })
    }

    toast.success(`已排程 ${valid.length} 篇貼文`)
  }

  // ── Render ───────────────────────────────────────────────────────

  const validCount = batchPosts.filter(
    (p) => !p.error && !p.generating,
  ).length

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            批次生成排程
          </h1>
          <p className="text-muted-foreground">
            一次生成多天的內容策略貼文
          </p>
        </div>
      </div>

      {/* ── Settings Card ──────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">生成設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Row 1: Account + Date */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Account selector */}
            <div className="space-y-2">
              <Label>帳號</Label>
              <Select
                value={selectedAccountId}
                onValueChange={(val) => setSelectedAccountId(val ?? '')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇帳號" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.displayName || acc.accountName} (
                      {PLATFORM_LABELS[acc.platform]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start date */}
            <div className="space-y-2">
              <Label>開始日期</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* Number of days */}
            <div className="space-y-2">
              <Label>天數</Label>
              <Input
                type="number"
                min={1}
                max={60}
                value={numDays}
                onChange={(e) =>
                  setNumDays(Math.max(1, parseInt(e.target.value) || 14))
                }
              />
            </div>

            {/* Posts per week */}
            <div className="space-y-2">
              <Label>每週篇數</Label>
              <Input
                type="number"
                min={1}
                max={14}
                value={postsPerWeek}
                onChange={(e) =>
                  setPostsPerWeek(
                    Math.max(1, parseInt(e.target.value) || 3),
                  )
                }
              />
            </div>
          </div>

          <Separator />

          {/* Row 2: Platforms */}
          <div className="space-y-2">
            <Label>發佈平台</Label>
            <div className="flex flex-wrap gap-4">
              {ALL_PLATFORMS.map((platform) => (
                <label
                  key={platform}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Checkbox
                    checked={selectedPlatforms.includes(platform)}
                    onCheckedChange={() => togglePlatform(platform)}
                  />
                  <span className="text-sm">
                    {PLATFORM_LABELS[platform]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Separator />

          {/* Row 3: AI provider + model */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>AI 提供者</Label>
              <Select
                value={aiProvider}
                onValueChange={(val) =>
                  setAiProvider(val as AIProvider)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(AI_PROVIDER_LABELS) as AIProvider[]
                  ).map((p) => (
                    <SelectItem key={p} value={p}>
                      {AI_PROVIDER_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>模型</Label>
              <Select
                value={aiModel}
                onValueChange={(val) => setAiModel(val ?? '')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS[aiProvider].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2 space-y-2">
              <div className="flex-1 space-y-2">
                <Label>自動分配公式</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoFormula}
                    onCheckedChange={setAutoFormula}
                  />
                  <span className="text-sm text-muted-foreground">
                    {autoFormula ? '自動' : '不指定'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Row 4: Topic textarea */}
          <div className="space-y-2">
            <Label>主題 / 方向</Label>
            <Textarea
              placeholder="輸入這批貼文的主題方向，例如：分享個人品牌經營心得、AI 工具實測系列、創業日常紀錄..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
            />
          </div>

          {/* Generate button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleBatchGenerate}
            disabled={batchStatus === 'generating'}
          >
            {batchStatus === 'generating' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中 ({generatingIndex + 1} / {batchPosts.length})
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                批次生成 {numDays} 天內容
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ── Results Table ──────────────────────────────────────── */}
      {batchPosts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              生成結果 ({validCount} / {batchPosts.length} 篇)
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSaveAll}
                disabled={
                  validCount === 0 || batchStatus === 'generating'
                }
              >
                <Save className="mr-2 h-4 w-4" />
                全部儲存
              </Button>
              <Button
                onClick={handleScheduleAll}
                disabled={
                  validCount === 0 || batchStatus === 'generating'
                }
              >
                <CalendarCheck className="mr-2 h-4 w-4" />
                全部排程
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="w-28">日期</TableHead>
                  <TableHead>標題預覽</TableHead>
                  <TableHead className="w-20">公式</TableHead>
                  <TableHead className="w-28">平台</TableHead>
                  <TableHead className="w-20">狀態</TableHead>
                  <TableHead className="w-32 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batchPosts.map((post, index) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-mono text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-sm">
                      {post.scheduledAt
                        ? format(
                            new Date(post.scheduledAt),
                            'MM/dd (EEE)',
                            { locale: zhTW },
                          )
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {post.generating ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          生成中...
                        </div>
                      ) : post.error ? (
                        <span className="text-sm text-destructive">
                          {post.error}
                        </span>
                      ) : editingIndex === index ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) =>
                              setEditContent(e.target.value)
                            }
                            rows={4}
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                            >
                              確認
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingIndex(null)}
                            >
                              取消
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <span
                          className="line-clamp-2 cursor-pointer text-sm"
                          title={post.contentText}
                          onClick={() => handleStartEdit(index)}
                        >
                          {post.title || post.contentText.slice(0, 60)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {post.formula ? (
                        <Badge variant="outline">{post.formula}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {post.platforms.map((p) => (
                          <Badge
                            key={p}
                            variant="secondary"
                            className="text-xs"
                          >
                            {PLATFORM_LABELS[p]?.slice(0, 2)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {post.generating ? (
                        <Badge variant="outline">生成中</Badge>
                      ) : post.error ? (
                        <Badge variant="destructive">失敗</Badge>
                      ) : (
                        <Badge
                          className={
                            STATUS_COLORS[post.status] || ''
                          }
                        >
                          {STATUS_LABELS[post.status] || post.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!post.generating && !post.error && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(index)}
                            title="編輯"
                          >
                            <PenSquare className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRegenerate(index)}
                          disabled={post.generating}
                          title="重新生成"
                        >
                          <RefreshCw
                            className={`h-3.5 w-3.5 ${
                              post.generating ? 'animate-spin' : ''
                            }`}
                          />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(index)}
                          disabled={post.generating}
                          title="刪除"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
