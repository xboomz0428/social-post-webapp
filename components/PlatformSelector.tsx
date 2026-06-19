'use client'
import { Platform, PLATFORM_LABELS } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const PLATFORM_ICONS: Record<Platform, string> = {
  facebook: '🔵',
  instagram: '📸',
  threads: '🧵',
  x: '🐦',
}

const PLATFORM_NOTE: Record<Platform, string> = {
  facebook: '手動發（個人頁無 API）',
  instagram: '需商業帳號',
  threads: 'API 自動發',
  x: 'API 自動發',
}

interface Props {
  selected: Platform[]
  onChange: (platforms: Platform[]) => void
}

export default function PlatformSelector({ selected, onChange }: Props) {
  const platforms: Platform[] = ['facebook', 'instagram', 'threads', 'x']

  function toggle(p: Platform) {
    onChange(
      selected.includes(p) ? selected.filter(s => s !== p) : [...selected, p]
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {platforms.map(p => (
        <label
          key={p}
          className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
            selected.includes(p)
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Checkbox
            checked={selected.includes(p)}
            onCheckedChange={() => toggle(p)}
            className="mt-0.5"
          />
          <div>
            <div className="font-medium text-sm">
              {PLATFORM_ICONS[p]} {PLATFORM_LABELS[p]}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{PLATFORM_NOTE[p]}</div>
          </div>
        </label>
      ))}
    </div>
  )
}
