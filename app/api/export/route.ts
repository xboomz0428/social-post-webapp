import { NextResponse } from 'next/server'
import type { Post, Platform } from '@/lib/types'
import { PLATFORM_LABELS, STATUS_LABELS } from '@/lib/types'

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function formatPlatforms(platforms: Platform[]): string {
  return platforms.map((p) => PLATFORM_LABELS[p] ?? p).join(', ')
}

function generateCSV(posts: Post[]): string {
  const headers = [
    '日期',
    '標題',
    '平台',
    '公式',
    '狀態',
    '讚',
    '留言',
    '分享',
    '觸及',
    '非追蹤者%',
    '備註',
  ]

  const rows = posts.map((post) => [
    formatDate(post.publishedAt ?? post.scheduledAt ?? post.createdAt),
    post.title,
    formatPlatforms(post.platforms),
    post.formula,
    STATUS_LABELS[post.status] ?? post.status,
    post.stats.likes?.toString() ?? '',
    post.stats.comments?.toString() ?? '',
    post.stats.shares?.toString() ?? '',
    post.stats.reach?.toString() ?? '',
    post.stats.nonFollowerPct != null
      ? `${post.stats.nonFollowerPct}%`
      : '',
    post.notes,
  ])

  const csvLines = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ]

  return csvLines.join('\n')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const posts: Post[] = body.posts ?? []

    if (!Array.isArray(posts)) {
      return NextResponse.json(
        { error: 'Invalid request: posts must be an array' },
        { status: 400 },
      )
    }

    const csv = generateCSV(posts)

    // Add UTF-8 BOM for Excel compatibility
    const BOM = '﻿'
    const csvWithBom = BOM + csv

    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const filename = `social_posts_report_${dateStr}.csv`

    return new Response(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    console.error('[Export API Error]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
