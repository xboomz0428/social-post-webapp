'use client'
import { useEffect, useState, useRef } from 'react'
import { getAccounts, getAppSettings, saveAppSettings } from '@/lib/storage'
import type { SocialAccount, AppSettings } from '@/lib/types'
import { PLATFORM_LABELS } from '@/lib/types'
import { ChevronDown, Plus, User } from 'lucide-react'
import Link from 'next/link'

const PLATFORM_ICONS: Record<string, string> = {
  facebook: '🔵', instagram: '📸', threads: '🧵', x: '🐦',
}

export default function AccountSwitcher() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setAccounts(getAccounts())
    setSettings(getAppSettings())
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const active = accounts.find(a => a.id === settings?.activeAccountId)

  function switchAccount(id: string) {
    const s = getAppSettings()
    saveAppSettings({ ...s, activeAccountId: id })
    setSettings({ ...s, activeAccountId: id })
    setOpen(false)
    window.dispatchEvent(new Event('account-switch'))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50 transition-colors max-w-[200px]"
      >
        {active ? (
          <>
            <span>{PLATFORM_ICONS[active.platform]}</span>
            <span className="truncate">{active.displayName || active.accountName || '未命名'}</span>
          </>
        ) : (
          <>
            <User className="h-4 w-4" />
            <span>選擇帳號</span>
          </>
        )}
        <ChevronDown className="h-3 w-3 opacity-50" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border rounded-lg shadow-lg z-50 py-1">
          <div className="px-3 py-1.5 text-xs font-medium text-gray-400">切換帳號</div>
          <div className="border-t my-1" />

          {accounts.length === 0 ? (
            <div className="px-3 py-3 text-sm text-gray-400 text-center">尚無帳號</div>
          ) : (
            accounts.map(a => (
              <button
                key={a.id}
                onClick={() => switchAccount(a.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 ${
                  a.id === settings?.activeAccountId ? 'bg-gray-100' : ''
                }`}
              >
                <span>{PLATFORM_ICONS[a.platform]}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {a.displayName || a.accountName || '未命名'}
                  </div>
                  <div className="text-xs text-gray-400">{PLATFORM_LABELS[a.platform]}</div>
                </div>
                {a.id === settings?.activeAccountId && (
                  <span className="text-green-500 text-xs">✓</span>
                )}
              </button>
            ))
          )}

          <div className="border-t my-1" />
          <Link
            href="/accounts"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            管理帳號
          </Link>
        </div>
      )}
    </div>
  )
}
