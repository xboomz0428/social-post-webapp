'use client'
import { useEffect, useState } from 'react'
import { getAccounts, saveAccount, deleteAccount, createAccount, getStyleProfile, saveStyleProfile, createStyleProfile } from '@/lib/storage'
import type { SocialAccount, Platform, StyleProfile } from '@/lib/types'
import { PLATFORM_LABELS } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Trash2, Settings, Pencil } from 'lucide-react'
import { toast } from 'sonner'

const ICONS: Record<Platform, string> = { facebook: '🔵', instagram: '📸', threads: '🧵', x: '🐦' }

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [editing, setEditing] = useState<SocialAccount | null>(null)
  const [styleEditing, setStyleEditing] = useState<StyleProfile | null>(null)
  const [addPlatform, setAddPlatform] = useState<Platform>('facebook')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => { setAccounts(getAccounts()) }, [])

  function handleAdd() {
    const acc = createAccount({ platform: addPlatform, displayName: `新帳號 (${PLATFORM_LABELS[addPlatform]})` })
    saveAccount(acc)
    setAccounts(getAccounts())
    setEditing(acc)
    setShowAdd(false)
    toast.success('帳號已新增')
  }

  function handleSave(acc: SocialAccount) {
    saveAccount(acc)
    setAccounts(getAccounts())
    setEditing(null)
    toast.success('帳號已更新')
  }

  function handleDelete(id: string) {
    if (!confirm('確定要刪除這個帳號？相關的貼文不會被刪除。')) return
    deleteAccount(id)
    setAccounts(getAccounts())
    toast.success('已刪除')
  }

  function openStyleEditor(accId: string) {
    let sp = getStyleProfile(accId)
    if (!sp) {
      sp = createStyleProfile(accId)
      saveStyleProfile(sp)
    }
    setStyleEditing(sp)
  }

  function handleSaveStyle(sp: StyleProfile) {
    saveStyleProfile(sp)
    setStyleEditing(null)
    toast.success('口吻設定已儲存')
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">帳號管理</h1>
          <p className="text-gray-500 text-sm mt-1">管理各平台的社群帳號、API 金鑰與發文口吻</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger render={<Button className="gap-2" />}>
            <Plus className="h-4 w-4" />新增帳號
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>新增社群帳號</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Label>選擇平台</Label>
              <Select value={addPlatform} onValueChange={v => { if (v) setAddPlatform(v as Platform) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['facebook', 'instagram', 'threads', 'x'] as Platform[]).map(p => (
                    <SelectItem key={p} value={p}>{ICONS[p]} {PLATFORM_LABELS[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={handleAdd}>建立帳號</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-gray-400">
          還沒有帳號，點擊「新增帳號」開始
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {accounts.map(acc => (
            <Card key={acc.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{ICONS[acc.platform]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{acc.displayName || acc.accountName || '未命名帳號'}</div>
                    <div className="text-sm text-gray-500">{PLATFORM_LABELS[acc.platform]}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      排程：每週 {acc.scheduleRules.postsPerWeek} 篇 · 偏好時段 {acc.scheduleRules.preferredTimes.join(', ')}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => openStyleEditor(acc.id)}>
                      <Pencil className="h-3 w-3" />口吻
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => setEditing(acc)}>
                      <Settings className="h-3 w-3" />設定
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600" onClick={() => handleDelete(acc.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Account Dialog */}
      <Dialog open={!!editing} onOpenChange={open => { if (!open) setEditing(null) }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>帳號設定</DialogTitle></DialogHeader>
          {editing && <AccountForm account={editing} onSave={handleSave} />}
        </DialogContent>
      </Dialog>

      {/* Style Profile Dialog */}
      <Dialog open={!!styleEditing} onOpenChange={open => { if (!open) setStyleEditing(null) }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>口吻 / 風格設定</DialogTitle></DialogHeader>
          {styleEditing && <StyleForm profile={styleEditing} onSave={handleSaveStyle} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AccountForm({ account, onSave }: { account: SocialAccount; onSave: (a: SocialAccount) => void }) {
  const [acc, setAcc] = useState(account)
  const u = (field: string, value: string | number | string[]) => setAcc(a => ({ ...a, [field]: value }))
  const uSchedule = (field: string, value: number | string[]) => setAcc(a => ({ ...a, scheduleRules: { ...a.scheduleRules, [field]: value } }))

  function updateKey(field: string, value: string) {
    setAcc(a => ({
      ...a,
      apiKeys: { ...a.apiKeys, keys: { ...a.apiKeys.keys, [field]: value } } as SocialAccount['apiKeys'],
    }))
  }

  return (
    <div className="space-y-4 pt-2">
      <div>
        <Label>帳號名稱（內部用）</Label>
        <Input value={acc.accountName} onChange={e => u('accountName', e.target.value)} placeholder="例：@mybrand_ig" />
      </div>
      <div>
        <Label>顯示名稱</Label>
        <Input value={acc.displayName} onChange={e => u('displayName', e.target.value)} placeholder="例：好漢草 FB" />
      </div>
      <Separator />
      <h3 className="font-medium text-sm">API 金鑰</h3>
      {acc.apiKeys.platform === 'facebook' && (
        <>
          <div><Label>Access Token</Label><Input type="password" value={acc.apiKeys.keys.accessToken} onChange={e => updateKey('accessToken', e.target.value)} /></div>
          <div><Label>Page ID</Label><Input value={acc.apiKeys.keys.pageId} onChange={e => updateKey('pageId', e.target.value)} /></div>
        </>
      )}
      {acc.apiKeys.platform === 'threads' && (
        <>
          <div><Label>Access Token</Label><Input type="password" value={acc.apiKeys.keys.accessToken} onChange={e => updateKey('accessToken', e.target.value)} /></div>
          <div><Label>User ID</Label><Input value={acc.apiKeys.keys.userId} onChange={e => updateKey('userId', e.target.value)} /></div>
        </>
      )}
      {acc.apiKeys.platform === 'instagram' && (
        <>
          <div><Label>Access Token</Label><Input type="password" value={acc.apiKeys.keys.accessToken} onChange={e => updateKey('accessToken', e.target.value)} /></div>
          <div><Label>Page ID</Label><Input value={acc.apiKeys.keys.pageId} onChange={e => updateKey('pageId', e.target.value)} /></div>
          <div><Label>IG User ID</Label><Input value={acc.apiKeys.keys.igUserId} onChange={e => updateKey('igUserId', e.target.value)} /></div>
        </>
      )}
      {acc.apiKeys.platform === 'x' && (
        <>
          <div><Label>API Key</Label><Input type="password" value={acc.apiKeys.keys.apiKey} onChange={e => updateKey('apiKey', e.target.value)} /></div>
          <div><Label>API Secret</Label><Input type="password" value={acc.apiKeys.keys.apiSecret} onChange={e => updateKey('apiSecret', e.target.value)} /></div>
          <div><Label>Access Token</Label><Input type="password" value={acc.apiKeys.keys.accessToken} onChange={e => updateKey('accessToken', e.target.value)} /></div>
          <div><Label>Access Secret</Label><Input type="password" value={acc.apiKeys.keys.accessSecret} onChange={e => updateKey('accessSecret', e.target.value)} /></div>
        </>
      )}
      <Separator />
      <h3 className="font-medium text-sm">排程設定</h3>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>每週幾篇</Label><Input type="number" min={1} max={21} value={acc.scheduleRules.postsPerWeek} onChange={e => uSchedule('postsPerWeek', +e.target.value)} /></div>
        <div><Label>每天最多</Label><Input type="number" min={1} max={5} value={acc.scheduleRules.postsPerDay} onChange={e => uSchedule('postsPerDay', +e.target.value)} /></div>
      </div>
      <div>
        <Label>偏好發文時段（逗號分隔）</Label>
        <Input value={acc.scheduleRules.preferredTimes.join(', ')} onChange={e => uSchedule('preferredTimes', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="09:00, 12:00, 18:00" />
      </div>
      <Button className="w-full" onClick={() => onSave(acc)}>儲存設定</Button>
    </div>
  )
}

function StyleForm({ profile, onSave }: { profile: StyleProfile; onSave: (p: StyleProfile) => void }) {
  const [sp, setSp] = useState(profile)
  const u = (f: keyof StyleProfile, v: string | string[]) => setSp(p => ({ ...p, [f]: v }))

  return (
    <div className="space-y-4 pt-2">
      <div><Label>口吻名稱</Label><Input value={sp.name} onChange={e => u('name', e.target.value)} placeholder="例：品牌正式風" /></div>
      <div><Label>語氣摘要</Label><Textarea rows={3} value={sp.toneSummary} onChange={e => u('toneSummary', e.target.value)} placeholder="口語實在、有溫度，說真話不說場面話..." /></div>
      <div><Label>範例貼文（每篇一行）</Label><Textarea rows={5} value={sp.samplePosts.join('\n---\n')} onChange={e => u('samplePosts', e.target.value.split('\n---\n').filter(Boolean))} placeholder="貼上 2-3 篇代表性貼文，用 --- 分隔" /></div>
      <div><Label>目標受眾</Label><Input value={sp.targetAudience} onChange={e => u('targetAudience', e.target.value)} placeholder="30-50 歲中小企業主" /></div>
      <div><Label>偏好 Hashtag（逗號分隔）</Label><Input value={sp.hashtagPrefs.join(', ')} onChange={e => u('hashtagPrefs', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} /></div>
      <div><Label>避免用語（逗號分隔）</Label><Input value={sp.avoidWords.join(', ')} onChange={e => u('avoidWords', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="護城河, 本質, 真正的..." /></div>
      <div><Label>自訂指令（給 AI 的額外說明）</Label><Textarea rows={3} value={sp.customInstructions} onChange={e => u('customInstructions', e.target.value)} placeholder="不要用太多感嘆號，語氣保持平實..." /></div>
      <Button className="w-full" onClick={() => onSave(sp)}>儲存口吻設定</Button>
    </div>
  )
}
