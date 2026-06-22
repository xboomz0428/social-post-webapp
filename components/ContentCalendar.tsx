'use client'
import { useMemo, useState, useRef } from 'react'
import type { Post, Platform, PostStatus } from '@/lib/types'
import { PLATFORM_LABELS, STATUS_LABELS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, PenSquare, MessageSquare, Copy } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { savePost } from '@/lib/storage'
import { toast } from 'sonner'
import {
  addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay, isToday, parseISO,
} from 'date-fns'
import { zhTW } from 'date-fns/locale'

const PLATFORM_DOT_COLORS: Record<Platform, string> = {
  facebook: 'bg-blue-500',
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  threads: 'bg-gray-800',
  x: 'bg-gray-600',
}

const PLATFORM_BG_COLORS: Record<Platform, string> = {
  facebook: 'border-l-blue-500 bg-blue-50',
  instagram: 'border-l-pink-500 bg-pink-50',
  threads: 'border-l-gray-800 bg-gray-50',
  x: 'border-l-gray-500 bg-gray-50',
}

const STATUS_INDICATOR: Record<PostStatus, { icon: string; className: string }> = {
  draft: { icon: '📝', className: 'text-gray-500' },
  scheduled: { icon: '⏰', className: 'text-blue-600' },
  published: { icon: '✅', className: 'text-green-600' },
  failed: { icon: '❌', className: 'text-red-600' },
}

interface Props {
  posts: Post[]
  onCopy?: (post: Post) => void
  onPostsChange?: () => void
}

export default function ContentCalendar({ posts, onCopy }: Props) {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dragPostId, setDragPostId] = useState<string | null>(null)
  const didDrag = useRef(false)

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentMonth])

  const postsByDate = useMemo(() => {
    const map = new Map<string, Post[]>()
    posts.forEach(post => {
      try {
        const raw = post.scheduledAt || post.createdAt
        if (!raw) return
        const parsed = parseISO(raw)
        if (isNaN(parsed.getTime())) return
        const dateStr = format(parsed, 'yyyy-MM-dd')
        if (!map.has(dateStr)) map.set(dateStr, [])
        map.get(dateStr)!.push(post)
      } catch {
        // skip posts with unparseable dates
      }
    })
    return map
  }, [posts])

  const weekdays = ['一', '二', '三', '四', '五', '六', '日']

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-bold">
          {format(currentMonth, 'yyyy 年 M 月', { locale: zhTW })}
        </h2>
        <Button variant="outline" size="sm" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Platform legend */}
      <div className="flex gap-4 text-xs flex-wrap">
        {(['facebook', 'instagram', 'threads', 'x'] as Platform[]).map(p => (
          <div key={p} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${PLATFORM_DOT_COLORS[p]}`} />
            <span className="text-gray-600">{PLATFORM_LABELS[p]}</span>
          </div>
        ))}
        <div className="border-l pl-4 flex gap-3">
          <span className="text-gray-500">📝 草稿</span>
          <span className="text-gray-500">⏰ 排程</span>
          <span className="text-gray-500">✅ 已發佈</span>
          <span className="text-gray-500">❌ 失敗</span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {weekdays.map(day => (
            <div key={day} className="px-2 py-2 text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayPosts = postsByDate.get(dateKey) || []
            const inMonth = isSameMonth(day, currentMonth)
            const today = isToday(day)

            return (
              <div
                key={i}
                className={`min-h-[110px] border-b border-r p-1.5 transition-colors ${
                  !inMonth ? 'bg-gray-50/50' : 'bg-white'
                } ${today ? 'ring-2 ring-inset ring-blue-400' : ''} ${dragPostId ? 'hover:bg-blue-50/50' : ''}`}
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                onDrop={e => {
                  e.preventDefault()
                  const postId = e.dataTransfer.getData('text/plain')
                  if (!postId) return
                  const post = posts.find(p => p.id === postId)
                  if (!post) return
                  const oldDate = post.scheduledAt ? parseISO(post.scheduledAt) : null
                  const time = oldDate ? format(oldDate, 'HH:mm:ss') : '09:00:00'
                  const newScheduled = `${dateKey}T${time}`
                  post.scheduledAt = newScheduled
                  post.updatedAt = new Date().toISOString()
                  if (post.status === 'draft') post.status = 'scheduled'
                  savePost(post)
                  setDragPostId(null)
                  toast.success(`已移至 ${format(day, 'M/d')}`)
                  window.location.reload()
                }}
              >
                {/* Date number */}
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                    today
                      ? 'bg-blue-600 text-white'
                      : inMonth
                        ? 'text-gray-700'
                        : 'text-gray-300'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {inMonth && (
                    <Link href={`/editor?date=${dateKey}`}>
                      <button className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-gray-300 hover:text-blue-500 transition-opacity">
                        <PenSquare className="h-3 w-3" />
                      </button>
                    </Link>
                  )}
                </div>

                {/* Posts */}
                <div className="space-y-1">
                  {dayPosts.slice(0, 3).map(post => {
                    const mainPlatform = post.platforms[0] as Platform
                    const statusInfo = STATUS_INDICATOR[post.status]
                    const bgColor = mainPlatform ? PLATFORM_BG_COLORS[mainPlatform] : 'border-l-gray-300 bg-gray-50'

                    return (
                      <div
                        key={post.id}
                        draggable
                        onMouseDown={() => { didDrag.current = false }}
                        onDragStart={e => {
                          didDrag.current = true
                          e.dataTransfer.setData('text/plain', post.id)
                          e.dataTransfer.effectAllowed = 'move'
                          setDragPostId(post.id)
                        }}
                        onDragEnd={() => setDragPostId(null)}
                        onClick={() => {
                          if (!didDrag.current) router.push(`/editor/${post.id}`)
                        }}
                        className={`border-l-[3px] rounded-r px-1.5 py-1 cursor-pointer hover:shadow-md transition-shadow group/card ${bgColor}`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-[10px]">{statusInfo.icon}</span>
                          <span className="text-[11px] font-medium truncate flex-1">
                            {post.title || post.contentText?.slice(0, 15) || '無標題'}
                          </span>
                          {onCopy && (
                            <button
                              className="opacity-0 group-hover/card:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity"
                              onClick={e => { e.stopPropagation(); onCopy(post) }}
                              title="複製貼文"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                          {/* Platform dots */}
                          <div className="flex items-center gap-1 mt-0.5">
                            {post.platforms.map(p => (
                              <div key={p} className={`w-2 h-2 rounded-full ${PLATFORM_DOT_COLORS[p as Platform]}`} />
                            ))}
                            {post.scheduledAt && (
                              <span className="text-[9px] text-gray-400 ml-auto">
                                {format(parseISO(post.scheduledAt), 'HH:mm')}
                              </span>
                            )}
                          </div>
                          {/* Notes badge for draft/published */}
                          {(post.status === 'draft' || post.status === 'published') && post.notes && (
                            <div className="flex items-center gap-0.5 mt-0.5">
                              <MessageSquare className="h-2.5 w-2.5 text-gray-400" />
                              <span className="text-[9px] text-gray-400 truncate">{post.notes.slice(0, 20)}</span>
                            </div>
                          )}
                          {/* Stats for published */}
                          {post.status === 'published' && (post.stats.likes || post.stats.comments) && (
                            <div className="text-[9px] text-gray-400 mt-0.5">
                              ❤️{post.stats.likes ?? 0} 💬{post.stats.comments ?? 0} 🔗{post.stats.shares ?? 0}
                            </div>
                          )}
                      </div>
                    )
                  })}
                  {dayPosts.length > 3 && (
                    <div className="text-[10px] text-gray-400 text-center">
                      +{dayPosts.length - 3} 篇
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
