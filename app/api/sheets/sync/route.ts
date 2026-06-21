import { NextResponse } from 'next/server'
import { getAllPosts, appendPost, ensureSheetsExist } from '@/lib/google-sheets'
import type { SheetConfig } from '@/lib/google-sheets'
import { google } from 'googleapis'

function getConfig(): SheetConfig | null {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!spreadsheetId || !serviceAccountKey) return null
  return { spreadsheetId, serviceAccountKey }
}

function getAuth(serviceAccountKey: string) {
  const credentials = JSON.parse(serviceAccountKey)
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

// Parse sheet rows back into Post-like objects
function parseRowToPost(row: string[]) {
  return {
    id: row[0] || '',
    accountId: row[1] || '',
    accountName: row[2] || '',
    title: row[3] || '',
    content: row[4] || '',
    contentText: row[4] || '',
    images: [],
    platforms: row[5] ? row[5].split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    formula: row[6] || '',
    dayNumber: parseInt(row[7] || '0', 10) || 0,
    status: row[8] || 'draft',
    scheduledAt: row[9] || null,
    publishedAt: row[10] || null,
    stats: {
      likes: parseInt(row[11] || '0', 10) || 0,
      comments: parseInt(row[12] || '0', 10) || 0,
      shares: parseInt(row[13] || '0', 10) || 0,
      reach: parseInt(row[14] || '0', 10) || 0,
      nonFollowerPct: parseFloat(row[15] || '0') || 0,
    },
    aiGenerated: row[16] === 'true',
    aiProvider: row[17] || null,
    notes: row[18] || '',
    createdAt: row[19] || new Date().toISOString(),
    updatedAt: row[20] || new Date().toISOString(),
  }
}

function postToRow(post: Record<string, unknown>): Record<string, string> {
  const p = post as Record<string, unknown>
  const stats = (p.stats || {}) as Record<string, unknown>
  const platforms = Array.isArray(p.platforms) ? (p.platforms as string[]).join(',') : String(p.platforms || '')
  return {
    id: String(p.id || ''),
    accountId: String(p.accountId || ''),
    accountName: String(p.accountName || ''),
    title: String(p.title || ''),
    contentText: String(p.contentText || p.content || ''),
    platforms,
    formula: String(p.formula || ''),
    dayNumber: String(p.dayNumber || 0),
    status: String(p.status || 'draft'),
    scheduledAt: String(p.scheduledAt || ''),
    publishedAt: String(p.publishedAt || ''),
    likes: String(stats.likes || ''),
    comments: String(stats.comments || ''),
    shares: String(stats.shares || ''),
    reach: String(stats.reach || ''),
    nonFollowerPct: String(stats.nonFollowerPct || ''),
    aiGenerated: String(p.aiGenerated || false),
    aiProvider: String(p.aiProvider || ''),
    notes: String(p.notes || ''),
    createdAt: String(p.createdAt || new Date().toISOString()),
    updatedAt: String(p.updatedAt || new Date().toISOString()),
  }
}

export async function POST(request: Request) {
  const config = getConfig()
  if (!config) {
    return NextResponse.json(
      { error: 'Google Sheets 未設定。請在環境變數設定 GOOGLE_SPREADSHEET_ID 和 GOOGLE_SERVICE_ACCOUNT_KEY' },
      { status: 400 },
    )
  }

  try {
    const body = await request.json()
    const { action } = body

    // ── STATUS ──────────────────────────────────────
    if (action === 'status') {
      try {
        const rows = await getAllPosts(config)
        return NextResponse.json({
          connected: true,
          sheetName: '貼文',
          postCount: Math.max(0, rows.length - 1), // minus header
        })
      } catch {
        return NextResponse.json({ connected: false, sheetName: '', postCount: 0 })
      }
    }

    // ── PULL ────────────────────────────────────────
    if (action === 'pull') {
      const rows = await getAllPosts(config)
      if (rows.length <= 1) {
        return NextResponse.json({ posts: [], count: 0 })
      }
      // Skip header row
      const posts = rows.slice(1).map(parseRowToPost).filter(p => p.id)
      return NextResponse.json({ posts, count: posts.length })
    }

    // ── PUSH ────────────────────────────────────────
    if (action === 'push') {
      const posts = body.posts as Record<string, unknown>[]
      if (!posts || !Array.isArray(posts)) {
        return NextResponse.json({ error: '缺少 posts 資料' }, { status: 400 })
      }

      // Ensure sheet exists
      await ensureSheetsExist(config)

      // Clear existing data (keep header row)
      const auth = getAuth(config.serviceAccountKey)
      const sheets = google.sheets({ version: 'v4', auth })
      await sheets.spreadsheets.values.clear({
        spreadsheetId: config.spreadsheetId,
        range: '貼文!A2:U',
      })

      // Write all posts
      for (const post of posts) {
        await appendPost(config, postToRow(post))
      }

      return NextResponse.json({ success: true, count: posts.length, message: `已推送 ${posts.length} 篇貼文` })
    }

    return NextResponse.json({ error: `未知操作：${action}` }, { status: 400 })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: `同步失敗：${err instanceof Error ? err.message : '未知錯誤'}` },
      { status: 500 },
    )
  }
}
