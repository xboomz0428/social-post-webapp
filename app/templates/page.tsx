'use client'
import { useState } from 'react'
import { FORMULA_TEMPLATES } from '@/lib/formulas'
import { PLATFORM_LABELS } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Copy, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const CATEGORY_LABELS: Record<string, string> = {
  basic: '基礎公式',
  viral: '廣推公式',
  thread: 'Threads 專用',
  'mode-c': '深度反思',
  storytelling: '敘事型',
  engagement: '互動型',
  educational: '教學型',
  promotional: '推廣型',
  personal: '個人型',
  community: '社群型',
}

export default function TemplatesPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<(typeof FORMULA_TEMPLATES)[number] | null>(null)

  const filtered = FORMULA_TEMPLATES.filter(f =>
    f.name.includes(search) || f.code.toLowerCase().includes(search.toLowerCase()) || f.description.includes(search)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">公式模板庫</h1>
        <p className="text-gray-500 text-sm mt-1">選擇驗證過的貼文公式，套用到你的內容</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          className="pl-10"
          placeholder="搜尋公式名稱、代號..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(f => (
          <Card
            key={f.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelected(f)}
          >
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-mono text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    {f.code}
                  </span>
                  <h3 className="font-medium mt-1">{f.name}</h3>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`w-1.5 h-4 rounded-full ${i < f.complexity ? 'bg-blue-500' : 'bg-gray-200'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{f.description}</p>
              <div className="flex gap-1 mt-3 flex-wrap">
                {f.targetPlatforms.map(p => (
                  <span key={p} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                    {PLATFORM_LABELS[p as keyof typeof PLATFORM_LABELS] ?? p}
                  </span>
                ))}
                <span className="text-xs bg-gray-50 text-gray-400 px-2 py-0.5 rounded">
                  {CATEGORY_LABELS[f.category] ?? f.category}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">找不到符合的公式</div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={o => { if (!o) setSelected(null) }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="font-mono text-sm bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    {selected.code}
                  </span>
                  {selected.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-gray-600">{selected.description}</p>
                <div>
                  <h4 className="text-sm font-medium mb-2">骨架 / 模板結構</h4>
                  <pre className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap text-gray-700 border">
                    {selected.skeleton}
                  </pre>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      navigator.clipboard.writeText(selected.skeleton)
                      toast.success('已複製骨架')
                    }}
                  >
                    <Copy className="h-4 w-4" />
                    複製骨架
                  </Button>
                  <Link href={`/editor?formula=${encodeURIComponent(selected.code)}`}>
                    <Button className="gap-2">
                      <ArrowRight className="h-4 w-4" />
                      用此公式新增貼文
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
