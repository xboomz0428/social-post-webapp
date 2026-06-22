import { NextResponse } from 'next/server'
import {
  ensureSheetsExist, appendPost, upsertPost, updatePostInSheet, getAllPosts,
  upsertAccount, getAllAccounts, deleteAccountFromSheet,
  upsertStyleProfile, getAllStyleProfiles, deleteStyleProfileFromSheet,
} from '@/lib/google-sheets'

function getConfig() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!spreadsheetId || !serviceAccountKey) {
    return null
  }
  return { spreadsheetId, serviceAccountKey }
}

export async function GET(request: Request) {
  const config = getConfig()
  if (!config) {
    return NextResponse.json({ error: 'Google Sheets 未設定' }, { status: 400 })
  }

  const url = new URL(request.url)
  const type = url.searchParams.get('type') || 'posts'

  try {
    if (type === 'all') {
      const [postRows, accountRows, styleRows] = await Promise.all([
        getAllPosts(config),
        getAllAccounts(config),
        getAllStyleProfiles(config),
      ])
      return NextResponse.json({
        success: true,
        posts: postRows,
        accounts: accountRows,
        styles: styleRows,
      })
    }

    if (type === 'accounts') {
      const rows = await getAllAccounts(config)
      return NextResponse.json({ success: true, rows })
    }

    if (type === 'styles') {
      const rows = await getAllStyleProfiles(config)
      return NextResponse.json({ success: true, rows })
    }

    const rows = await getAllPosts(config)
    return NextResponse.json({ success: true, count: rows.length - 1, rows })
  } catch (err: unknown) {
    return NextResponse.json({ error: `讀取失敗：${err instanceof Error ? err.message : '未知錯誤'}` }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const config = getConfig()
  if (!config) {
    return NextResponse.json({ error: 'Google Sheets 未設定' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { action } = body

    if (action === 'init') {
      const result = await ensureSheetsExist(config)
      return NextResponse.json({ success: true, message: `Sheets 初始化完成`, ...result })
    }

    if (action === 'append') {
      await appendPost(config, body.post)
      return NextResponse.json({ success: true, message: '貼文已寫入 Google Sheets' })
    }

    if (action === 'upsert') {
      await upsertPost(config, body.post)
      return NextResponse.json({ success: true, message: '貼文已同步到 Google Sheets' })
    }

    if (action === 'update') {
      await updatePostInSheet(config, body.postId, body.updates)
      return NextResponse.json({ success: true, message: '貼文已更新' })
    }

    // Account operations
    if (action === 'upsert-account') {
      await upsertAccount(config, body.account)
      return NextResponse.json({ success: true, message: '帳號已同步' })
    }

    if (action === 'delete-account') {
      await deleteAccountFromSheet(config, body.accountId)
      return NextResponse.json({ success: true, message: '帳號已從雲端刪除' })
    }

    // Style profile operations
    if (action === 'upsert-style') {
      await upsertStyleProfile(config, body.style)
      return NextResponse.json({ success: true, message: '口吻已同步' })
    }

    if (action === 'delete-style') {
      await deleteStyleProfileFromSheet(config, body.styleId)
      return NextResponse.json({ success: true, message: '口吻已從雲端刪除' })
    }

    return NextResponse.json({ error: `未知操作：${action}` }, { status: 400 })
  } catch (err: unknown) {
    return NextResponse.json({ error: `操作失敗：${err instanceof Error ? err.message : '未知錯誤'}` }, { status: 500 })
  }
}
