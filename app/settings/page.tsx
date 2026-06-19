'use client'
import { useEffect, useState } from 'react'
import { getAPIKeys, saveAPIKeys } from '@/lib/storage'
import { APIKeys } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Eye, EyeOff, Save } from 'lucide-react'

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
  const [keys, setKeys] = useState<APIKeys>({
    threads: { accessToken: '', userId: '' },
    x: { apiKey: '', apiSecret: '', accessToken: '', accessSecret: '' },
    instagram: { accessToken: '', pageId: '', igUserId: '' },
  })

  useEffect(() => { setKeys(getAPIKeys()) }, [])

  function update<T extends keyof APIKeys>(platform: T, field: string, value: string) {
    setKeys(k => ({ ...k, [platform]: { ...k[platform], [field]: value } }))
  }

  function handleSave() {
    saveAPIKeys(keys)
    toast.success('API 設定已儲存（僅存在本機）')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">API 設定</h1>
        <p className="text-gray-500 text-sm mt-1">
          API Key 僅儲存在你的瀏覽器本機，不會上傳到任何伺服器
        </p>
      </div>

      {/* Threads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            🧵 Threads API
          </CardTitle>
          <CardDescription>
            到 Meta 開發者平台申請 Threads API 存取權限，取得 Access Token
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Access Token</Label>
            <MaskInput
              value={keys.threads.accessToken}
              onChange={v => update('threads', 'accessToken', v)}
              placeholder="THQWJRiH..."
            />
          </div>
          <div>
            <Label>User ID</Label>
            <Input
              value={keys.threads.userId}
              onChange={e => update('threads', 'userId', e.target.value)}
              placeholder="1234567890"
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* X */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            🐦 X (Twitter) API
          </CardTitle>
          <CardDescription>
            到 developer.twitter.com 建立 App，取得 API Key 和 Access Token
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'API Key', field: 'apiKey', placeholder: 'xvz1evFS4wEEPTGEFPHBog' },
            { label: 'API Secret', field: 'apiSecret', placeholder: 'L8qq9PZyRg6ieKGEKhZolGC0vJWLw8iEJ88DRdyOg' },
            { label: 'Access Token', field: 'accessToken', placeholder: '756201191646691328-...' },
            { label: 'Access Token Secret', field: 'accessSecret', placeholder: 'IpT9...' },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <Label>{label}</Label>
              <MaskInput
                value={(keys.x as unknown as Record<string, string>)[field]}
                onChange={v => update('x', field, v)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Instagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            📸 Instagram API
          </CardTitle>
          <CardDescription>
            需綁定 Meta 商業帳號。到 Meta Business Suite 取得 Page Access Token
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Page Access Token', field: 'accessToken', placeholder: 'EAABsb...' },
            { label: 'Facebook Page ID', field: 'pageId', placeholder: '1234567890' },
            { label: 'Instagram User ID', field: 'igUserId', placeholder: '9876543210' },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <Label>{label}</Label>
              <MaskInput
                value={(keys.instagram as unknown as Record<string, string>)[field]}
                onChange={v => update('instagram', field, v)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Facebook note */}
      <Card className="border-dashed border-gray-300 bg-gray-50">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <span className="text-2xl">🔵</span>
            <div>
              <div className="font-medium text-sm">Facebook 個人頁</div>
              <p className="text-sm text-gray-500 mt-1">
                Meta 不開放個人頁面的 API 發文權限。Facebook 貼文請繼續透過 Claude in Chrome 自動操作瀏覽器發佈。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="gap-2 w-full">
        <Save className="h-4 w-4" />
        儲存所有設定
      </Button>
    </div>
  )
}
