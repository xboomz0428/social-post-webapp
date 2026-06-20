'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PenSquare, Settings, Users, BookTemplate, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import AccountSwitcher from './AccountSwitcher'

const links = [
  { href: '/', label: '排程總覽', icon: LayoutDashboard },
  { href: '/editor', label: '新增貼文', icon: PenSquare },
  { href: '/templates', label: '公式模板', icon: BookTemplate },
  { href: '/accounts', label: '帳號', icon: Users },
  { href: '/settings', label: '設定', icon: Settings },
  { href: '/guide', label: '說明', icon: HelpCircle },
]

export default function Navbar() {
  const pathname = usePathname()
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight">📅 Social Post</span>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{label}</span>
            </Link>
          ))}
          <div className="ml-2 pl-2 border-l">
            <AccountSwitcher />
          </div>
        </nav>
      </div>
    </header>
  )
}
