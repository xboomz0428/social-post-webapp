'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { Platform } from '@/lib/types'
import { PLATFORM_LABELS } from '@/lib/types'

interface PlatformPreviewProps {
  content: string
  platforms: Platform[]
  images: string[]
}

const PLATFORM_LIMITS: Record<Platform, number> = {
  facebook: 63206,
  instagram: 2200,
  threads: 500,
  x: 280,
}

function CharCount({ current, limit }: { current: number; limit: number }) {
  const pct = current / limit
  const color =
    pct > 1
      ? 'text-red-500'
      : pct > 0.9
        ? 'text-amber-500'
        : 'text-gray-400'

  return (
    <span className={`text-xs font-mono ${color}`}>
      {current}/{limit}
      {pct > 1 && ' (超過上限)'}
    </span>
  )
}

/* ── Facebook Preview ────────────────────────────────────────────── */

function FacebookPreview({ content, images }: { content: string; images: string[] }) {
  const truncated = content.length > 477
  const displayText = truncated ? content.slice(0, 477) + '...' : content

  return (
    <div className="mx-auto max-w-[500px] rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header bar */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          U
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">使用者名稱</p>
          <p className="text-xs text-gray-500">剛才 &middot; 🌐</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
          {displayText}
        </p>
        {truncated && (
          <button className="text-sm text-gray-500 hover:underline mt-1">
            ...顯示更多
          </button>
        )}
      </div>

      {/* Image */}
      {images.length > 0 && (
        <div className="border-t border-gray-100">
          <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
            <img
              src={images[0]}
              alt="Post image"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-around border-t border-gray-200 px-2 py-2">
        <button className="flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
          <span>👍</span> 讚
        </button>
        <button className="flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
          <span>💬</span> 留言
        </button>
        <button className="flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
          <span>↗️</span> 分享
        </button>
      </div>
    </div>
  )
}

/* ── Instagram Preview ───────────────────────────────────────────── */

function InstagramPreview({ content, images }: { content: string; images: string[] }) {
  const truncated = content.length > 125
  const displayText = truncated ? content.slice(0, 125) : content

  // Extract hashtags from content
  const hashtagMatch = content.match(/#\S+/g)
  const hashtags = hashtagMatch ? hashtagMatch.slice(0, 15).join(' ') : ''

  return (
    <div className="mx-auto max-w-[470px] rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[2px]">
          <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
            <span className="text-[10px] font-bold text-gray-800">U</span>
          </div>
        </div>
        <p className="text-sm font-semibold text-gray-900">username</p>
      </div>

      {/* Image area */}
      {images.length > 0 ? (
        <div className="aspect-square bg-gray-100 overflow-hidden">
          <img
            src={images[0]}
            alt="Post image"
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square bg-gray-50 flex flex-col items-center justify-center border-y border-gray-100">
          <span className="text-4xl mb-2">📷</span>
          <p className="text-sm text-amber-600 font-medium">需要至少一張圖片</p>
          <p className="text-xs text-gray-400 mt-1">Instagram 貼文必須包含圖片</p>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-4">
          <span className="text-xl cursor-pointer">♡</span>
          <span className="text-xl cursor-pointer">💬</span>
          <span className="text-xl cursor-pointer">📤</span>
        </div>
        <span className="text-xl cursor-pointer">🔖</span>
      </div>

      {/* Caption */}
      <div className="px-3 pb-3">
        <p className="text-sm text-gray-900">
          <span className="font-semibold mr-1">username</span>
          <span className="whitespace-pre-wrap">{displayText}</span>
          {truncated && (
            <button className="text-gray-400 ml-1">...更多</button>
          )}
        </p>
        {hashtags && (
          <p className="text-sm text-blue-900/70 mt-1">{hashtags}</p>
        )}
      </div>
    </div>
  )
}

/* ── Threads Preview ─────────────────────────────────────────────── */

function ThreadsPreview({ content }: { content: string }) {
  return (
    <div className="mx-auto max-w-[580px] rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex gap-3 p-4">
        {/* Profile + thread line */}
        <div className="flex flex-col items-center">
          <div className="h-9 w-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
            U
          </div>
          <div className="mt-1.5 flex-1 w-[2px] bg-gray-200 rounded-full" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">username</p>
            <p className="text-xs text-gray-400">2分</p>
          </div>
          <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
            {content}
          </p>

          {/* Action bar */}
          <div className="mt-3 flex items-center gap-5">
            <button className="text-gray-500 hover:text-gray-700">
              <span className="text-base">♡</span>
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <span className="text-base">💬</span>
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <span className="text-base">🔄</span>
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <span className="text-base">📤</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── X (Twitter) Preview ─────────────────────────────────────────── */

function XPreview({ content, images }: { content: string; images: string[] }) {
  return (
    <div className="mx-auto max-w-[580px] rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex gap-3 p-4">
        {/* Profile pic */}
        <div className="h-10 w-10 shrink-0 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-bold">
          U
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-sm font-bold text-gray-900">使用者名稱</p>
            <span className="text-sm text-gray-500">@username</span>
            <span className="text-sm text-gray-400">&middot;</span>
            <span className="text-sm text-gray-500">現在</span>
          </div>

          <p className="mt-1 text-[15px] text-gray-900 whitespace-pre-wrap leading-snug">
            {content}
          </p>

          {/* Image */}
          {images.length > 0 && (
            <div className="mt-3 rounded-2xl border border-gray-200 overflow-hidden">
              <div className="aspect-video bg-gray-100">
                <img
                  src={images[0]}
                  alt="Post image"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className="mt-3 flex items-center justify-between max-w-[400px]">
            <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500">
              <span className="text-sm">💬</span>
              <span className="text-xs">0</span>
            </button>
            <button className="flex items-center gap-1 text-gray-500 hover:text-green-500">
              <span className="text-sm">🔄</span>
              <span className="text-xs">0</span>
            </button>
            <button className="flex items-center gap-1 text-gray-500 hover:text-pink-500">
              <span className="text-sm">♡</span>
              <span className="text-xs">0</span>
            </button>
            <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500">
              <span className="text-sm">📊</span>
              <span className="text-xs">0</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────────── */

export default function PlatformPreview({
  content,
  platforms,
  images,
}: PlatformPreviewProps) {
  const activePlatforms = platforms.length > 0 ? platforms : (['facebook'] as Platform[])
  const [activeTab, setActiveTab] = useState<string>(activePlatforms[0])

  // Ensure activeTab is valid
  const currentTab = activePlatforms.includes(activeTab as Platform)
    ? activeTab
    : activePlatforms[0]

  const plainContent = content.replace(/<[^>]*>/g, '').trim()

  if (platforms.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        請先選擇至少一個發佈平台來預覽
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={currentTab} onValueChange={(val) => setActiveTab(val as string)}>
        <TabsList variant="line">
          {activePlatforms.map((platform) => (
            <TabsTrigger key={platform} value={platform}>
              {PLATFORM_LABELS[platform]}
            </TabsTrigger>
          ))}
        </TabsList>

        {activePlatforms.map((platform) => (
          <TabsContent key={platform} value={platform}>
            <div className="space-y-3 pt-4">
              {/* Character count bar */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-gray-500">
                  {PLATFORM_LABELS[platform]} 預覽
                </span>
                <CharCount
                  current={plainContent.length}
                  limit={PLATFORM_LIMITS[platform]}
                />
              </div>

              {/* Platform-specific preview */}
              <div className="rounded-lg bg-gray-50 p-4">
                {platform === 'facebook' && (
                  <FacebookPreview content={plainContent} images={images} />
                )}
                {platform === 'instagram' && (
                  <InstagramPreview content={plainContent} images={images} />
                )}
                {platform === 'threads' && (
                  <ThreadsPreview content={plainContent} />
                )}
                {platform === 'x' && (
                  <XPreview content={plainContent} images={images} />
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
