import { NextResponse } from 'next/server'
import { ensureSheetsExist, appendPost, updatePostInSheet, getAllPosts } from '@/lib/google-sheets'

function getConfig() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!spreadsheetId || !serviceAccountKey) {
    return null
  }
  return { spreadsheetId, serviceAccountKey }
}

export async function GET() {
  const config = getConfig()
  if (!config) {
    return NextResponse.json({ error: 'Google Sheets 未設定。請在 Vercel 環境變數設定 GOOGLE_SPREADSHEET_ID 和 GOOGLE_SERVICE_ACCOUNT_KEY' }, { status: 400 })
  }

  try {
    const rows = await getAllPosts(config)
    return NextResponse.json({ success: true, count: rows.length - 1, rows })
  } catch (err: unknown) {
    return NextResponse.json({ error: `讀取失敗：${err instanceof Error ? err.message : '未知錯誤'}` }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const config = getConfig()
  if (!config) {
    return NextResponse.json({ error: 'Google Sheets 未設定。請在 Vercel 環境變數設定 GOOGLE_SPREADSHEET_ID 和 GOOGLE_SERVICE_ACCOUNT_KEY' }, { status: 400 })
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

    if (action === 'update') {
      await updatePostInSheet(config, body.postId, body.updates)
      return NextResponse.json({ success: true, message: '貼文已更新' })
    }

    return NextResponse.json({ error: `未知操作：${action}` }, { status: 400 })
  } catch (err: unknown) {
    return NextResponse.json({ error: `操作失敗：${err instanceof Error ? err.message : '未知錯誤'}` }, { status: 500 })
  }
}
