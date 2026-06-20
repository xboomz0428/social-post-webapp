'use client'
import { useEffect, useState } from 'react'
import type { Post, PostStatus, Platform, AIProvider, StyleProfile } from '@/lib/types'
import { AI_PROVIDER_LABELS, AI_MODELS, PLATFORM_LABELS } from '@/lib/types'
import { getAIConfig, getAccounts, getAppSettings, getStyleProfile } from '@/lib/storage'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import PlatformSelector from './PlatformSelector'
import RichTextEditor from './RichTextEditor'
import { Save, Send, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { FORMULA_TEMPLATES } from '@/lib/formulas'

interface Props {
  initialData?: Post
  onSave: (data: Partial<Post>) => void
  saving?: boolean
  defaultFormula?: string
}

export default function PostForm({ initialData, onSave, saving, defaultFormula }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [contentText, setContentText] = useState(initialData?.contentText ?? '')
  const [images, setImages] = useState<string[]>(initialData?.images ?? [])
  const [platforms, setPlatforms] = useState<Platform[]>(initialData?.platforms ?? [])
  const [scheduledAt, setScheduledAt] = useState(initialData?.scheduledAt ? initialData.scheduledAt.slice(0, 16) : '')
  const [status, setStatus] = useState<PostStatus>(initialData?.status ?? 'draft')
  const [formula, setFormula] = useState(initialData?.formula ?? defaultFormula ?? '')
  const [dayNumber, setDayNumber] = useState(String(initialData?.dayNumber ?? ''))
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [stats, setStats] = useState(initialData?.stats ?? {})
  const [accountId, setAccountId] = useState(initialData?.accountId ?? '')

  // AI generation
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiProvider, setAiProvider] = useState<AIProvider>('google')
  const [aiModel, setAiModel] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const cfg = getAIConfig()
    setAiProvider(cfg.activeProvider)
    setAiModel(cfg[cfg.activeProvider].model)
    const settings = getAppSettings()
    if (!accountId && settings.activeAccountId) setAccountId(settings.activeAccountId)
  }, [accountId])

  const accounts = typeof window !== 'undefined' ? getAccounts() : []

  async function handleAIGenerate() {
    const cfg = getAIConfig()
    const providerCfg = cfg[aiProvider]
    if (!providerCfg.apiKey) {
      toast.error('請先到設定頁面設定 AI API Key')
      return
    }
    if (!aiPrompt.trim()) {
      toast.error('請輸入題材 / 方向')
      return
    }

    setGenerating(true)
    try {
      let styleProfile: Partial<StyleProfile> | undefined
      if (accountId) {
        const sp = getStyleProfile(accountId)
        if (sp) styleProfile = sp
      }

      const formulaObj = FORMULA_TEMPLATES.find(f => f.code === formula)
      const targetPlatform = platforms[0] || 'facebook'

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: aiProvider,
          apiKey: providerCfg.apiKey,
          model: aiModel || providerCfg.model,
          temperature: providerCfg.temperature,
          prompt: aiPrompt,
          platform: targetPlatform,
          accountName: accounts.find(a => a.id === accountId)?.displayName || '',
          styleProfile: styleProfile ? {
            toneSummary: styleProfile.toneSummary,
            samplePosts: styleProfile.samplePosts,
            targetAudience: styleProfile.targetAudience,
            customInstructions: styleProfile.customInstructions,
          } : undefined,
          formula: formulaObj ? { name: formulaObj.name, skeleton: formulaObj.skeleton, description: formulaObj.description } : undefined,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setContent(`<p>${data.content.replace(/\n/g, '</p><p>')}</p>`)
      setContentText(data.content)
      toast.success(`AI 已生成內容（${AI_PROVIDER_LABELS[aiProvider]}）`)
    } catch (err: unknown) {
      toast.error(`生成失敗：${err instanceof Error ? err.message : '未知錯誤'}`)
    }
    setGenerating(false)
  }

  function handleSubmit(newStatus?: PostStatus) {
    onSave({
      accountId,
      title,
      content,
      contentText,
      images,
      platforms,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      status: newStatus ?? status,
      formula,
      dayNumber: Number(dayNumber) || 0,
      notes,
      stats,
      aiGenerated: generating ? true : initialData?.aiGenerated,
      aiProvider: generating ? aiProvider : initialData?.aiProvider,
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main editor */}
      <div className="lg:col-span-2 space-y-4">
        {/* AI Generation */}
        <Card className="border-purple-200 bg-purple-50/30">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <h3 className="font-medium text-sm text-purple-900">AI 生成</h3>
            </div>
            <Textarea
              rows={3}
              placeholder="輸入題材 / 方向，例如：好漢草在恩主公醫院護師節快閃活動，帶了泡腳配方..."
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
            />
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label className="text-xs">AI 提供者</Label>
                <Select value={aiProvider} onValueChange={v => {
                  if (!v) return
                  setAiProvider(v as AIProvider)
                  setAiModel(AI_MODELS[v as AIProvider][0])
                }}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['openai', 'anthropic', 'google'] as AIProvider[]).map(p => (
                      <SelectItem key={p} value={p}>{AI_PROVIDER_LABELS[p]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-xs">模型</Label>
                <Select value={aiModel} onValueChange={v => { if (v) setAiModel(v) }}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AI_MODELS[aiProvider].map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAIGenerate}
                disabled={generating || !aiPrompt.trim()}
                className="gap-2 bg-purple-600 hover:bg-purple-700 shrink-0"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                生成
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 space-y-4">
            <div>
              <Label>標題（內部用）</Label>
              <Input className="mt-1" placeholder="例：Day 1 F6b-A 通路開發工具" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>貼文內容</Label>
              <div className="mt-1">
                <RichTextEditor
                  content={content}
                  onChange={(html, text) => { setContent(html); setContentText(text) }}
                  onImagesChange={setImages}
                  placeholder="開始輸入貼文內容，可插入圖片..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {contentText && (
          <Card>
            <CardContent className="pt-4">
              <Label className="text-sm font-medium">純文字預覽</Label>
              <div className="mt-2 bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap text-gray-700 max-h-48 overflow-y-auto">
                {contentText}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-4">
            <Label>備註 / 題材說明</Label>
            <Textarea className="mt-1 resize-none" rows={3} placeholder="給自己的備忘..." value={notes} onChange={e => setNotes(e.target.value)} />
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Account */}
        {accounts.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <Label>所屬帳號</Label>
              <Select value={accountId} onValueChange={v => { if (v) setAccountId(v) }}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="選擇帳號" /></SelectTrigger>
                <SelectContent>
                  {accounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {PLATFORM_LABELS[a.platform]} - {a.displayName || a.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-4">
            <Label className="mb-3 block">發佈平台</Label>
            <PlatformSelector selected={platforms} onChange={setPlatforms} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 space-y-3">
            <Label>排程時間</Label>
            <Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
            <div>
              <Label className="text-xs text-gray-500">狀態</Label>
              <Select value={status} onValueChange={v => { if (v) setStatus(v as PostStatus) }}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="scheduled">已排程</SelectItem>
                  <SelectItem value="published">已發佈</SelectItem>
                  <SelectItem value="failed">發佈失敗</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 space-y-3">
            <Label>公式 / Day</Label>
            <Select value={formula} onValueChange={v => setFormula(v ?? '')}>
              <SelectTrigger><SelectValue placeholder="選擇公式" /></SelectTrigger>
              <SelectContent>
                {FORMULA_TEMPLATES.map(f => (
                  <SelectItem key={f.code} value={f.code}>{f.code} {f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Day 幾" value={dayNumber} min={1} max={14} onChange={e => setDayNumber(e.target.value)} />
          </CardContent>
        </Card>

        {status === 'published' && (
          <Card>
            <CardContent className="pt-4 space-y-3">
              <Label>戰績數據</Label>
              {(['likes', 'comments', 'shares', 'reach'] as const).map(key => (
                <div key={key}>
                  <Label className="text-xs text-gray-500">
                    {{ likes: '讚', comments: '留言', shares: '分享', reach: '觸及' }[key]}
                  </Label>
                  <Input type="number" className="mt-1" value={stats[key] ?? ''} onChange={e => setStats(s => ({ ...s, [key]: Number(e.target.value) || undefined }))} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Separator />
        <div className="space-y-2">
          <Button className="w-full gap-2" onClick={() => handleSubmit()} disabled={saving}>
            <Save className="h-4 w-4" />{saving ? '儲存中...' : '儲存草稿'}
          </Button>
          {scheduledAt && (
            <Button variant="outline" className="w-full gap-2" onClick={() => handleSubmit('scheduled')} disabled={saving}>
              <Send className="h-4 w-4" />設為排程
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
