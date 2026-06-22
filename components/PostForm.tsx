'use client'
import { useEffect, useState } from 'react'
import type { Post, PostStatus, Platform, AIProvider, StyleProfile } from '@/lib/types'
import { AI_PROVIDER_LABELS, AI_MODELS, PLATFORM_LABELS } from '@/lib/types'
import { getAIConfig, getAccounts, getAppSettings, getStyleProfilesByAccount, getStyleProfileById } from '@/lib/storage'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import PlatformSelector from './PlatformSelector'
import RichTextEditor from './RichTextEditor'
import PlatformPreview from './PlatformPreview'
import { Save, Send, Sparkles, Loader2, Rocket, AlertCircle, Hash, Eye, ImagePlus } from 'lucide-react'
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
  const [styleProfileId, setStyleProfileId] = useState('')

  // AI generation
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiProvider, setAiProvider] = useState<AIProvider>('google')
  const [aiModel, setAiModel] = useState('')
  const [generating, setGenerating] = useState(false)
  // Publishing
  const [publishing, setPublishing] = useState(false)
  const [publishResults, setPublishResults] = useState<{ platform: string; ok: boolean; message: string }[]>([])
  // AI Image
  const [generatingImage, setGeneratingImage] = useState(false)
  const [imagePrompt, setImagePrompt] = useState('')
  // Hashtag + Preview
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([])
  const [loadingHashtags, setLoadingHashtags] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

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
      if (styleProfileId) {
        const sp = getStyleProfileById(styleProfileId)
        if (sp) styleProfile = sp
      } else if (accountId) {
        const profiles = getStyleProfilesByAccount(accountId)
        if (profiles.length > 0) styleProfile = profiles[0]
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

  async function handleAIImage() {
    const cfg = getAIConfig()
    const providerCfg = cfg.openai
    if (!providerCfg.apiKey) {
      toast.error('AI 圖片生成需要 OpenAI API Key（DALL-E 3），請先到設定頁面設定')
      return
    }
    const prompt = imagePrompt.trim() || aiPrompt.trim() || contentText.slice(0, 200)
    if (!prompt) {
      toast.error('請輸入圖片描述或先生成文字內容')
      return
    }
    setGeneratingImage(true)
    try {
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'openai', apiKey: providerCfg.apiKey, prompt }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.url) {
        setImages(prev => [...prev, data.url])
        toast.success('AI 圖片已生成並加入貼文')
      }
    } catch (err: unknown) {
      toast.error(`圖片生成失敗：${err instanceof Error ? err.message : '未知錯誤'}`)
    }
    setGeneratingImage(false)
  }

  async function handlePublishNow() {
    if (!contentText.trim() || platforms.length === 0) return
    if (!confirm(`確定要立即發佈到 ${platforms.map(p => PLATFORM_LABELS[p]).join('、')} 嗎？`)) return

    setPublishing(true)
    setPublishResults([])
    const results: typeof publishResults = []

    const account = accounts.find(a => a.id === accountId)

    for (const platform of platforms) {
      try {
        let apiKeysForPlatform: Record<string, string> = {}
        if (account && account.apiKeys.platform === platform) {
          apiKeysForPlatform = account.apiKeys.keys as unknown as Record<string, string>
        }

        const res = await fetch('/api/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform,
            content: contentText,
            imageUrl: images[0] && !images[0].startsWith('data:') ? images[0] : undefined,
            apiKeys: apiKeysForPlatform,
          }),
        })
        const data = await res.json()
        if (data.success) {
          results.push({ platform: PLATFORM_LABELS[platform], ok: true, message: `已發佈${data.url ? ` → ${data.url}` : ''}` })
        } else {
          results.push({ platform: PLATFORM_LABELS[platform], ok: false, message: data.error })
        }
      } catch (err) {
        results.push({ platform: PLATFORM_LABELS[platform], ok: false, message: '連線失敗' })
      }
    }

    setPublishResults(results)
    setPublishing(false)

    const allOk = results.every(r => r.ok)
    if (allOk) {
      setStatus('published')
      toast.success('所有平台發佈成功！')
    } else {
      toast.error('部分平台發佈失敗，請查看結果')
    }

    syncToSheets('published')
  }

  async function syncToSheets(postStatus: string) {
    try {
      const account = accounts.find(a => a.id === accountId)
      await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'append',
          post: {
            id: initialData?.id || crypto.randomUUID(),
            accountId,
            accountName: account?.displayName || account?.accountName || '',
            title,
            contentText,
            platforms: platforms.join(', '),
            formula,
            dayNumber: String(dayNumber),
            status: postStatus,
            scheduledAt: scheduledAt || '',
            publishedAt: postStatus === 'published' ? new Date().toISOString() : '',
            likes: '', comments: '', shares: '', reach: '', nonFollowerPct: '',
            aiGenerated: String(generating),
            aiProvider: aiProvider || '',
            notes,
            createdAt: initialData?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      })
    } catch {
      // Google Sheets sync is best-effort
    }
  }

  function handleSubmit(newStatus?: PostStatus) {
    syncToSheets(newStatus ?? status)
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
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label className="text-xs">AI 圖片描述（選填，留空用題材）</Label>
                <Input
                  className="h-9"
                  placeholder="描述想要的圖片風格..."
                  value={imagePrompt}
                  onChange={e => setImagePrompt(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={handleAIImage}
                disabled={generatingImage}
                className="gap-2 shrink-0 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                {generatingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                AI 生成圖片
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
          <>
            {/* Hashtag + Preview buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={loadingHashtags || !contentText.trim()}
                onClick={async () => {
                  const cfg = getAIConfig()
                  const providerCfg = cfg[aiProvider]
                  if (!providerCfg.apiKey) return
                  setLoadingHashtags(true)
                  try {
                    const res = await fetch('/api/ai/hashtags', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        provider: aiProvider,
                        apiKey: providerCfg.apiKey,
                        model: aiModel || providerCfg.model,
                        content: contentText,
                        platform: platforms[0] || 'facebook',
                        language: 'zh-TW',
                      }),
                    })
                    const data = await res.json()
                    if (data.hashtags) setSuggestedHashtags(data.hashtags)
                  } catch {}
                  setLoadingHashtags(false)
                }}
              >
                {loadingHashtags ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Hash className="h-3.5 w-3.5" />}
                推薦 Hashtag
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setShowPreview(p => !p)}
              >
                <Eye className="h-3.5 w-3.5" />
                {showPreview ? '隱藏預覽' : '跨平台預覽'}
              </Button>
            </div>

            {/* Hashtag suggestions */}
            {suggestedHashtags.length > 0 && (
              <Card>
                <CardContent className="pt-3 pb-3">
                  <Label className="text-xs text-gray-500">推薦 Hashtag（點擊複製）</Label>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {suggestedHashtags.map(tag => (
                      <button
                        key={tag}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
                        onClick={() => navigator.clipboard.writeText(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <button
                    className="text-xs text-gray-400 hover:text-gray-600 mt-2"
                    onClick={() => {
                      navigator.clipboard.writeText(suggestedHashtags.join(' '))
                    }}
                  >
                    複製全部
                  </button>
                </CardContent>
              </Card>
            )}

            {/* Platform Preview */}
            {showPreview && (
              <PlatformPreview content={contentText} platforms={platforms} images={images} />
            )}

            {/* Plain text preview */}
            <Card>
              <CardContent className="pt-4">
                <Label className="text-sm font-medium">純文字預覽</Label>
                <div className="mt-2 bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap text-gray-700 max-h-48 overflow-y-auto">
                  {contentText}
                </div>
              </CardContent>
            </Card>
          </>
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

        {accountId && (() => {
          const profiles = getStyleProfilesByAccount(accountId)
          if (profiles.length === 0) return null
          return (
            <Card>
              <CardContent className="pt-4">
                <Label>口吻風格</Label>
                <Select value={styleProfileId} onValueChange={v => setStyleProfileId(v ?? '')}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="自動（預設第一組）" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">自動（預設第一組）</SelectItem>
                    {profiles.map(sp => (
                      <SelectItem key={sp.id} value={sp.id}>
                        {sp.name || '未命名口吻'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {styleProfileId && styleProfileId !== 'auto' && (() => {
                  const sp = profiles.find(p => p.id === styleProfileId)
                  return sp?.toneSummary ? (
                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{sp.toneSummary}</p>
                  ) : null
                })()}
              </CardContent>
            </Card>
          )
        })()}

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
          {platforms.length > 0 && contentText.trim() && (
            <Button
              className="w-full gap-2 bg-green-600 hover:bg-green-700"
              onClick={handlePublishNow}
              disabled={publishing}
            >
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              {publishing ? '發佈中...' : '立即發佈'}
            </Button>
          )}
          {publishResults.length > 0 && (
            <div className="space-y-1 mt-2">
              {publishResults.map((r, i) => (
                <div key={i} className={`text-xs flex items-center gap-1.5 p-2 rounded ${r.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {r.ok ? '✓' : <AlertCircle className="h-3 w-3" />}
                  {r.platform}: {r.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
