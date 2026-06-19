'use client'
import { useState } from 'react'
import { Post, PostStatus } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import PlatformSelector from './PlatformSelector'
import RichTextEditor from './RichTextEditor'
import { Platform } from '@/lib/types'
import { Save, Send } from 'lucide-react'

const FORMULAS = [
  'F1 Day-N 開發日誌', 'F2 截圖先丟再講', 'F3 實測翻車版',
  'F4 里程碑+投票', 'F5 工具對打', 'F6a 邀請碼',
  'F6b-A promo型', 'F6b-B 復盤型', 'F6b-D social proof型',
  'F7 POV吐槽', 'F8 Credibility Piggyback',
  'F19 Thread立場', 'Mode A 日常', 'Mode C 深度反思',
]

interface Props {
  initialData?: Post
  onSave: (data: Partial<Post>) => void
  saving?: boolean
}

export default function PostForm({ initialData, onSave, saving }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [contentText, setContentText] = useState(initialData?.contentText ?? '')
  const [images, setImages] = useState<string[]>(initialData?.images ?? [])
  const [platforms, setPlatforms] = useState<Platform[]>(initialData?.platforms ?? [])
  const [scheduledAt, setScheduledAt] = useState(
    initialData?.scheduledAt ? initialData.scheduledAt.slice(0, 16) : ''
  )
  const [status, setStatus] = useState<PostStatus>(initialData?.status ?? 'draft')
  const [formula, setFormula] = useState(initialData?.formula ?? '')
  const [dayNumber, setDayNumber] = useState(String(initialData?.dayNumber ?? ''))
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [stats, setStats] = useState(initialData?.stats ?? {})

  function handleSubmit(newStatus?: PostStatus) {
    onSave({
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
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main editor */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div>
              <Label>標題（內部用）</Label>
              <Input
                className="mt-1"
                placeholder="例：Day 1 F6b-A 通路開發工具"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
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

        {/* Per-platform preview */}
        {platforms.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <Label className="text-sm font-medium">純文字預覽</Label>
              <div className="mt-2 bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap text-gray-700 max-h-48 overflow-y-auto">
                {contentText || '（尚未輸入內容）'}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <Card>
          <CardContent className="pt-4">
            <Label>備註 / 題材說明</Label>
            <Textarea
              className="mt-1 resize-none"
              rows={3}
              placeholder="給自己的備忘，不會發出去..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Platform */}
        <Card>
          <CardContent className="pt-4">
            <Label className="mb-3 block">發佈平台</Label>
            <PlatformSelector selected={platforms} onChange={setPlatforms} />
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Label>排程時間</Label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
            />
            <div>
              <Label className="text-xs text-gray-500">狀態</Label>
              <Select value={status} onValueChange={v => { if (v) setStatus(v as PostStatus) }}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
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

        {/* Formula */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Label>公式 / Day</Label>
            <Select value={formula} onValueChange={v => setFormula(v ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="選擇公式" />
              </SelectTrigger>
              <SelectContent>
                {FORMULAS.map(f => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Day 幾（1-14）"
              value={dayNumber}
              min={1} max={14}
              onChange={e => setDayNumber(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Stats (if published) */}
        {status === 'published' && (
          <Card>
            <CardContent className="pt-4 space-y-3">
              <Label>戰績數據</Label>
              {(['likes', 'comments', 'shares', 'reach'] as const).map(key => (
                <div key={key}>
                  <Label className="text-xs text-gray-500">
                    {key === 'likes' ? '讚' : key === 'comments' ? '留言' : key === 'shares' ? '分享' : '觸及人數'}
                  </Label>
                  <Input
                    type="number"
                    className="mt-1"
                    value={stats[key] ?? ''}
                    onChange={e => setStats(s => ({ ...s, [key]: Number(e.target.value) || undefined }))}
                  />
                </div>
              ))}
              <div>
                <Label className="text-xs text-gray-500">非追蹤者 %</Label>
                <Input
                  type="number"
                  className="mt-1"
                  placeholder="例：96.5"
                  value={stats.nonFollowerPct ?? ''}
                  onChange={e => setStats(s => ({ ...s, nonFollowerPct: Number(e.target.value) || undefined }))}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          <Button className="w-full gap-2" onClick={() => handleSubmit()} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? '儲存中...' : '儲存草稿'}
          </Button>
          {scheduledAt && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => handleSubmit('scheduled')}
              disabled={saving}
            >
              <Send className="h-4 w-4" />
              設為排程
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
