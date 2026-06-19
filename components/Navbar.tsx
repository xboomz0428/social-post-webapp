'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PenSquare, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: '排程總覽', icon: LayoutDashboard },
  { href: '/editor', label: '新增貼文', icon: PenSquare },
  { href: '/settings', label: 'API 設定', icon: Settings },
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
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
