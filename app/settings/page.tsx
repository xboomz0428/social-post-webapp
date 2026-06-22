'use client'
import { useEffect, useState } from 'react'
import { getAIConfig, saveAIConfig, getAppSettings, saveAppSettings, getPosts, savePost, getAccounts, saveAccount, getStyleProfilesByAccount } from '@/lib/storage'
import type { AIConfig, AIProvider, AppSettings } from '@/lib/types'
import { AI_PROVIDER_LABELS, AI_MODELS } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Eye, EyeOff, Save, Zap, Check, X, Loader2, ArrowUpFromLine, ArrowDownToLine, RefreshCw, Download, Upload, Cloud, HardDrive } from 'lucide-react'
import SetupGuide from '@/components/SetupGuide'
import { AI_PROVIDER_GUIDES, GOOGLE_SHEETS_GUIDE } from '@/lib/setup-guides'
import { pullAllFromCloud, syncAccountToCloud, syncStyleToCloud } from '@/lib/cloud-sync'

function MaskInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10 font-mono text-sm"
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        onClick={() => setShow(s => !s)}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const [ai, setAI] = useState<AIConfig | null>(null)
  const [app, setApp] = useState<AppSettings | null>(null)
  const [testing, setTesting] = useState<AIProvider | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; msg: string }>>({})
  const [syncing, setSyncing] = useState<'push' | 'pull' | null>(null)
  const [syncStatus, setSyncStatus] = useState<{ connected: boolean; postCount: number; lastSync: string | null }>({ connected: false, postCount: 0, lastSync: null })

  useEffect(() => {
    setAI(getAIConfig())
    setApp(getAppSettings())
    // Check sheets sync status
    fetch('/api/sheets/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'status' }),
    })
      .then(r => r.json())
      .then(data => setSyncStatus(prev => ({ ...prev, connected: data.connected, postCount: data.postCount })))
      .catch(() => {})
  }, [])

  if (!ai || !app) return null

  function updateProvider(provider: AIProvider, field: string, value: string | number) {
    setAI(c => c ? { ...c, [provider]: { ...c[provider], [field]: value } } : c)
  }

  function handleSave() {
    if (ai) saveAIConfig(ai)
    if (app) saveAppSettings(app)
    toast.success('設定已儲存')
  }

  async function testConnection(provider: AIProvider) {
    if (!ai) return
    setTesting(provider)
    setTestResults(r => ({ ...r, [provider]: { ok: false, msg: '測試中...' } }))
    try {
      const cfg = ai[provider]
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: cfg.apiKey, model: cfg.model }),
      })
      const data = await res.json()
      setTestResults(r => ({
        ...r,
        [provider]: { ok: data.success, msg: data.success ? `✓ ${data.message}` : `✗ ${data.message}` },
      }))
    } catch (err) {
      setTestResults(r => ({ ...r, [provider]: { ok: false, msg: '連線失敗' } }))
    }
    setTesting(null)
  }

  const providers: { key: AIProvider; icon: string; desc: string; placeholder: string }[] = [
    { key: 'openai', icon: '🟢', desc: '到 platform.openai.com 取得 API Key', placeholder: 'sk-...' },
    { key: 'anthropic', icon: '🟠', desc: '到 console.anthropic.com 取得 API Key', placeholder: 'sk-ant-...' },
    { key: 'google', icon: '🔵', desc: '到 aistudio.google.com 取得 API Key', placeholder: 'AIza...' },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">設定</h1>
        <p className="text-gray-500 text-sm mt-1">AI 模型設定、Google Sheets 連接</p>
      </div>

      {/* Active AI Provider */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">預設 AI 提供者</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={ai.activeProvider} onValueChange={v => { if (v) setAI(c => c ? { ...c, activeProvider: v as AIProvider } : c) }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['openai', 'anthropic', 'google'] as AIProvider[]).map(p => (
                <SelectItem key={p} value={p}>{AI_PROVIDER_LABELS[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Provider configs */}
      {providers.map(({ key, icon, desc, placeholder }) => (
        <Card key={key} className={ai.activeProvider === key ? 'ring-2 ring-blue-500' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {icon} {AI_PROVIDER_LABELS[key]}
              {ai.activeProvider === key && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">預設</span>}
            </CardTitle>
            <CardDescription>{desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>API Key</Label>
              <MaskInput
                value={ai[key].apiKey}
                onChange={v => updateProvider(key, 'apiKey', v)}
                placeholder={placeholder}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>模型</Label>
                <Select value={ai[key].model} onValueChange={v => { if (v) updateProvider(key, 'model', v) }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AI_MODELS[key].map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Temperature</Label>
                <Input
                  type="number"
                  min={0} max={1} step={0.1}
                  value={ai[key].temperature}
                  onChange={e => updateProvider(key, 'temperature', +e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline" size="sm" className="gap-2"
                onClick={() => testConnection(key)}
                disabled={!ai[key].apiKey || testing === key}
              >
                {testing === key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                測試連線
              </Button>
              {testResults[key] && (
                <span className={`text-sm ${testResults[key].ok ? 'text-green-600' : 'text-red-500'}`}>
                  {testResults[key].msg}
                </span>
              )}
            </div>
            {AI_PROVIDER_GUIDES[key] && (
              <SetupGuide
                title={AI_PROVIDER_GUIDES[key].title}
                steps={AI_PROVIDER_GUIDES[key].steps}
              />
            )}
          </CardContent>
        </Card>
      ))}

      <Separator />

      {/* Google Sheets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📊 Google Sheets 儲存</CardTitle>
          <CardDescription>貼文資料自動同步到 Google Sheets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            ⚠️ Google Sheets 需要在 <strong>Vercel 環境變數</strong>設定以下兩個值（不是在這個頁面填入）：
            <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
              <li><code>GOOGLE_SPREADSHEET_ID</code> — 試算表的 ID</li>
              <li><code>GOOGLE_SERVICE_ACCOUNT_KEY</code> — Service Account 的 JSON 金鑰（整個 JSON 內容）</li>
            </ul>
          </div>
          <div>
            <Label>Spreadsheet ID（僅供記錄）</Label>
            <Input
              value={app.googleSheetId}
              onChange={e => setApp(a => a ? { ...a, googleSheetId: e.target.value } : a)}
              placeholder="從 Google Sheets URL 中取得"
              className="font-mono text-sm"
            />
          </div>
          <div>
            <Label>Service Account Email（僅供記錄）</Label>
            <Input
              value={app.googleServiceAccountEmail}
              onChange={e => setApp(a => a ? { ...a, googleServiceAccountEmail: e.target.value } : a)}
              placeholder="xxx@xxx.iam.gserviceaccount.com"
              className="font-mono text-sm"
            />
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={async () => {
              try {
                const res = await fetch('/api/sheets', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'init' }),
                })
                const data = await res.json()
                if (data.success) {
                  toast.success(`Google Sheets 已連線！${data.created?.length ? '建立了工作表：' + data.created.join(', ') : '所有工作表已存在'}`)
                  setSyncStatus(prev => ({ ...prev, connected: true }))
                } else {
                  toast.error(data.error)
                }
              } catch {
                toast.error('連線失敗')
              }
            }}
          >
            <Zap className="h-4 w-4" />
            測試連線 & 初始化工作表
          </Button>

          {/* Sync buttons */}
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RefreshCw className="h-4 w-4" />
              <span>資料同步</span>
              {syncStatus.connected && (
                <Badge variant="outline" className="text-green-600 border-green-300">已連線</Badge>
              )}
              {syncStatus.postCount > 0 && (
                <span className="text-xs text-gray-400">Sheets 上有 {syncStatus.postCount} 篇貼文</span>
              )}
            </div>
            {syncStatus.lastSync && (
              <p className="text-xs text-gray-400">上次同步：{syncStatus.lastSync}</p>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={syncing !== null}
                onClick={async () => {
                  setSyncing('push')
                  try {
                    const allPosts = getPosts()
                    const res = await fetch('/api/sheets/sync', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'push', posts: allPosts }),
                    })
                    const data = await res.json()
                    if (data.success) {
                      toast.success(`已推送 ${data.count} 篇貼文到 Google Sheets`)
                      setSyncStatus(prev => ({ ...prev, postCount: data.count, lastSync: new Date().toLocaleString('zh-TW') }))
                    } else {
                      toast.error(data.error || '推送失敗')
                    }
                  } catch {
                    toast.error('推送失敗')
                  }
                  setSyncing(null)
                }}
              >
                {syncing === 'push' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpFromLine className="h-4 w-4" />}
                推送到 Sheets
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={syncing !== null}
                onClick={async () => {
                  if (!confirm('從 Sheets 拉取會覆蓋目前本機的所有貼文，確定繼續？')) return
                  setSyncing('pull')
                  try {
                    const res = await fetch('/api/sheets/sync', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'pull' }),
                    })
                    const data = await res.json()
                    if (data.posts) {
                      // Save pulled posts to localStorage
                      localStorage.setItem('social_posts', JSON.stringify(data.posts))
                      toast.success(`已從 Sheets 拉取 ${data.count} 篇貼文`)
                      setSyncStatus(prev => ({ ...prev, postCount: data.count, lastSync: new Date().toLocaleString('zh-TW') }))
                    } else {
                      toast.error(data.error || '拉取失敗')
                    }
                  } catch {
                    toast.error('拉取失敗')
                  }
                  setSyncing(null)
                }}
              >
                {syncing === 'pull' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />}
                從 Sheets 拉取
              </Button>
            </div>
          </div>

          <SetupGuide
            title={GOOGLE_SHEETS_GUIDE.title}
            steps={GOOGLE_SHEETS_GUIDE.steps}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Cloud Backup & Restore */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">☁️ 雲端備份管理</CardTitle>
          <CardDescription>備份所有資料到電腦，或在不同裝置間同步</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Backup to computer */}
            <Button
              variant="outline"
              className="gap-2 h-auto py-3 flex-col items-start"
              onClick={() => {
                const allAccounts = getAccounts()
                const allPosts = getPosts()
                const allStyles: unknown[] = []
                allAccounts.forEach(acc => {
                  getStyleProfilesByAccount(acc.id).forEach(sp => allStyles.push(sp))
                })
                const backup = {
                  version: '3.0.0',
                  exportedAt: new Date().toISOString(),
                  accounts: allAccounts,
                  posts: allPosts,
                  styles: allStyles,
                  aiConfig: getAIConfig(),
                  appSettings: getAppSettings(),
                }
                const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `social-post-backup-${new Date().toISOString().slice(0, 10)}.json`
                a.click()
                URL.revokeObjectURL(url)
                toast.success('備份檔案已下載')
              }}
            >
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span className="font-medium">備份到電腦</span>
              </div>
              <span className="text-xs text-gray-400 font-normal">下載 JSON 檔（含帳號、口吻、貼文、AI 設定）</span>
            </Button>

            {/* Restore from computer */}
            <Button
              variant="outline"
              className="gap-2 h-auto py-3 flex-col items-start"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.json'
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (!file) return
                  try {
                    const text = await file.text()
                    const backup = JSON.parse(text)
                    if (!backup.accounts && !backup.posts) {
                      toast.error('無效的備份檔案')
                      return
                    }
                    if (!confirm(`確定要從備份檔案還原？\n帳號：${backup.accounts?.length || 0} 個\n貼文：${backup.posts?.length || 0} 篇\n口吻：${backup.styles?.length || 0} 組\n\n這會合併到現有資料（不會刪除現有的）`)) return

                    let imported = 0
                    if (backup.accounts) {
                      const existing = new Set(getAccounts().map((a: {id:string}) => a.id))
                      for (const acc of backup.accounts) {
                        if (!existing.has(acc.id)) { saveAccount(acc); imported++ }
                      }
                    }
                    if (backup.posts) {
                      const existing = new Set(getPosts().map((p: {id:string}) => p.id))
                      for (const post of backup.posts) {
                        if (!existing.has(post.id)) { savePost(post); imported++ }
                      }
                    }
                    if (backup.styles) {
                      for (const sp of backup.styles) {
                        const { saveStyleProfile } = await import('@/lib/storage')
                        saveStyleProfile(sp)
                        imported++
                      }
                    }
                    if (backup.aiConfig) {
                      saveAIConfig(backup.aiConfig)
                    }
                    toast.success(`已還原 ${imported} 筆資料`)
                    window.location.reload()
                  } catch {
                    toast.error('備份檔案格式錯誤')
                  }
                }
                input.click()
              }}
            >
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="font-medium">從電腦還原</span>
              </div>
              <span className="text-xs text-gray-400 font-normal">上傳 JSON 備份檔，合併到現有資料</span>
            </Button>

            {/* Push all to cloud */}
            <Button
              variant="outline"
              className="gap-2 h-auto py-3 flex-col items-start"
              disabled={syncing !== null}
              onClick={async () => {
                if (!confirm('確定要將本機所有資料（帳號 + 口吻 + 貼文）推送到 Google Sheets？')) return
                setSyncing('push')
                try {
                  const allAccounts = getAccounts()
                  const allPosts = getPosts()

                  // Push accounts
                  for (const acc of allAccounts) {
                    await syncAccountToCloud(acc)
                  }

                  // Push style profiles
                  for (const acc of allAccounts) {
                    const styles = getStyleProfilesByAccount(acc.id)
                    for (const sp of styles) {
                      await syncStyleToCloud(sp)
                    }
                  }

                  // Push posts
                  const res = await fetch('/api/sheets/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'push', posts: allPosts }),
                  })
                  const data = await res.json()

                  toast.success(`已推送到雲端：${allAccounts.length} 帳號、${data.count || allPosts.length} 貼文`)
                  setSyncStatus(prev => ({ ...prev, lastSync: new Date().toLocaleString('zh-TW') }))
                } catch {
                  toast.error('推送失敗')
                }
                setSyncing(null)
              }}
            >
              <div className="flex items-center gap-2">
                {syncing === 'push' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />}
                <span className="font-medium">全部寫入雲端</span>
              </div>
              <span className="text-xs text-gray-400 font-normal">推送帳號 + 口吻 + 貼文到 Google Sheets</span>
            </Button>

            {/* Pull all from cloud */}
            <Button
              variant="outline"
              className="gap-2 h-auto py-3 flex-col items-start"
              disabled={syncing !== null}
              onClick={async () => {
                if (!confirm('從雲端拉取所有資料？會合併到本機（不會刪除現有的）')) return
                setSyncing('pull')
                try {
                  const cloud = await pullAllFromCloud()
                  if (!cloud) { toast.error('拉取失敗'); setSyncing(null); return }

                  let imported = 0
                  const existingAccIds = new Set(getAccounts().map(a => a.id))
                  for (const acc of cloud.accounts) {
                    if (!existingAccIds.has(acc.id)) { saveAccount(acc); imported++ }
                  }
                  const existingPostIds = new Set(getPosts().map(p => p.id))
                  for (const post of cloud.posts) {
                    if (!existingPostIds.has(post.id)) { savePost(post); imported++ }
                    else {
                      const local = getPosts().find(p => p.id === post.id)
                      if (local && post.updatedAt > local.updatedAt) { savePost({ ...local, ...post }) }
                    }
                  }
                  const { saveStyleProfile } = await import('@/lib/storage')
                  for (const sp of cloud.styles) {
                    saveStyleProfile(sp)
                    imported++
                  }

                  toast.success(`已從雲端拉取 ${imported} 筆資料`)
                  setSyncStatus(prev => ({ ...prev, lastSync: new Date().toLocaleString('zh-TW') }))
                  if (imported > 0) window.location.reload()
                } catch {
                  toast.error('拉取失敗')
                }
                setSyncing(null)
              }}
            >
              <div className="flex items-center gap-2">
                {syncing === 'pull' ? <Loader2 className="h-4 w-4 animate-spin" /> : <HardDrive className="h-4 w-4" />}
                <span className="font-medium">全部從雲端拉回</span>
              </div>
              <span className="text-xs text-gray-400 font-normal">從 Google Sheets 拉取帳號 + 口吻 + 貼文</span>
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            💡 <strong>跨電腦使用</strong>：在新電腦第一次開啟 App 時會自動從雲端拉資料。如果沒有自動拉，請手動點「全部從雲端拉回」。AI API Keys 因安全考量不存雲端，需在每台電腦的「設定」頁面重新輸入，或用「備份到電腦」→「從電腦還原」搬移。
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="gap-2 w-full" size="lg">
        <Save className="h-4 w-4" />
        儲存所有設定
      </Button>
    </div>
  )
}
