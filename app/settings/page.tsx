'use client'
import { useEffect, useState } from 'react'
import { getAIConfig, saveAIConfig, getAppSettings, saveAppSettings } from '@/lib/storage'
import type { AIConfig, AIProvider, AppSettings } from '@/lib/types'
import { AI_PROVIDER_LABELS, AI_MODELS } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Eye, EyeOff, Save, Zap, Check, X, Loader2 } from 'lucide-react'
import SetupGuide from '@/components/SetupGuide'
import { AI_PROVIDER_GUIDES, GOOGLE_SHEETS_GUIDE } from '@/lib/setup-guides'

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

  useEffect(() => {
    setAI(getAIConfig())
    setApp(getAppSettings())
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
          <CardDescription>將貼文資料同步到 Google Sheets（開發中）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Google Spreadsheet ID</Label>
            <Input
              value={app.googleSheetId}
              onChange={e => setApp(a => a ? { ...a, googleSheetId: e.target.value } : a)}
              placeholder="從 Google Sheets URL 中取得"
              className="font-mono text-sm"
            />
          </div>
          <div>
            <Label>Service Account Email</Label>
            <Input
              value={app.googleServiceAccountEmail}
              onChange={e => setApp(a => a ? { ...a, googleServiceAccountEmail: e.target.value } : a)}
              placeholder="xxx@xxx.iam.gserviceaccount.com"
              className="font-mono text-sm"
            />
          </div>
          <SetupGuide
            title={GOOGLE_SHEETS_GUIDE.title}
            steps={GOOGLE_SHEETS_GUIDE.steps}
          />
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="gap-2 w-full" size="lg">
        <Save className="h-4 w-4" />
        儲存所有設定
      </Button>
    </div>
  )
}
