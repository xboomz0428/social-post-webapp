'use client'
import { useEffect, useState } from 'react'
import { getAccounts, getAppSettings, saveAppSettings } from '@/lib/storage'
import type { SocialAccount, AppSettings } from '@/lib/types'
import { PLATFORM_LABELS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Plus, User } from 'lucide-react'
import Link from 'next/link'

const PLATFORM_ICONS: Record<string, string> = {
  facebook: '🔵', instagram: '📸', threads: '🧵', x: '🐦',
}

export default function AccountSwitcher() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)

  useEffect(() => {
    setAccounts(getAccounts())
    setSettings(getAppSettings())
  }, [])

  const active = accounts.find(a => a.id === settings?.activeAccountId)

  function switchAccount(id: string) {
    const s = getAppSettings()
    saveAppSettings({ ...s, activeAccountId: id })
    setSettings({ ...s, activeAccountId: id })
    window.dispatchEvent(new Event('account-switch'))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="gap-2 max-w-[200px]" />}>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>切換帳號</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {accounts.length === 0 ? (
          <div className="px-2 py-3 text-sm text-gray-400 text-center">尚無帳號</div>
        ) : (
          accounts.map(a => (
            <DropdownMenuItem
              key={a.id}
              onClick={() => switchAccount(a.id)}
              className={a.id === settings?.activeAccountId ? 'bg-gray-100' : ''}
            >
              <span className="mr-2">{PLATFORM_ICONS[a.platform]}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {a.displayName || a.accountName || '未命名'}
                </div>
                <div className="text-xs text-gray-400">{PLATFORM_LABELS[a.platform]}</div>
              </div>
              {a.id === settings?.activeAccountId && (
                <span className="text-green-500 text-xs ml-2">✓</span>
              )}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/accounts" className="gap-2" />}>
          <Plus className="h-4 w-4" />
          管理帳號
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
