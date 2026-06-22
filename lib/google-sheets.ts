import { google } from 'googleapis'

export interface SheetConfig {
  spreadsheetId: string
  serviceAccountKey: string
}

function getAuth(serviceAccountKey: string) {
  const credentials = JSON.parse(serviceAccountKey)
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

function getSheets(serviceAccountKey: string) {
  const auth = getAuth(serviceAccountKey)
  return google.sheets({ version: 'v4', auth })
}

export async function ensureSheetsExist(config: SheetConfig) {
  const sheets = getSheets(config.serviceAccountKey)

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: config.spreadsheetId,
  })

  const existingSheets = spreadsheet.data.sheets?.map(s => s.properties?.title) ?? []

  const requiredSheets = [
    { title: '貼文', headers: ['ID', '帳號ID', '帳號名稱', '標題', '內容', '平台', '公式', 'Day', '狀態', '排程時間', '發佈時間', '讚', '留言', '分享', '觸及', '非追蹤者%', 'AI生成', 'AI提供者', '備註', '建立時間', '更新時間', '平台貼文ID'] },
    { title: '帳號', headers: ['ID', '平台', '帳號名稱', '顯示名稱', '每週篇數', '每天上限', '偏好時段', '啟用', '建立時間', 'API金鑰JSON', '排程規則JSON'] },
    { title: '口吻設定', headers: ['ID', '帳號ID', '名稱', '語氣摘要', '範例貼文', '目標受眾', '偏好Hashtag', '避免用語', '自訂指令'] },
  ]

  const sheetsToCreate = requiredSheets.filter(r => !existingSheets.includes(r.title))

  if (sheetsToCreate.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: config.spreadsheetId,
      requestBody: {
        requests: sheetsToCreate.map(s => ({
          addSheet: { properties: { title: s.title } },
        })),
      },
    })

    for (const s of sheetsToCreate) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: config.spreadsheetId,
        range: `${s.title}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: [s.headers] },
      })
    }
  }

  return { created: sheetsToCreate.map(s => s.title), existing: existingSheets }
}

export async function appendPost(config: SheetConfig, post: Record<string, string>) {
  const sheets = getSheets(config.serviceAccountKey)

  const row = [
    post.id, post.accountId, post.accountName, post.title,
    post.contentText, post.platforms, post.formula, post.dayNumber,
    post.status, post.scheduledAt || '', post.publishedAt || '',
    post.likes || '', post.comments || '', post.shares || '',
    post.reach || '', post.nonFollowerPct || '',
    post.aiGenerated || '', post.aiProvider || '', post.notes,
    post.createdAt, post.updatedAt, post.platformPostId || '',
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId: config.spreadsheetId,
    range: '貼文!A:V',
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  })
}

export async function upsertPost(config: SheetConfig, post: Record<string, string>) {
  const sheets = getSheets(config.serviceAccountKey)

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: '貼文!A:A',
  })

  const ids = result.data.values ?? []
  const rowIndex = ids.findIndex(r => r[0] === post.id)

  const row = [
    post.id, post.accountId, post.accountName, post.title,
    post.contentText, post.platforms, post.formula, post.dayNumber,
    post.status, post.scheduledAt || '', post.publishedAt || '',
    post.likes || '', post.comments || '', post.shares || '',
    post.reach || '', post.nonFollowerPct || '',
    post.aiGenerated || '', post.aiProvider || '', post.notes,
    post.createdAt, post.updatedAt, post.platformPostId || '',
  ]

  if (rowIndex >= 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.spreadsheetId,
      range: `貼文!A${rowIndex + 1}:V${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    })
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: '貼文!A:V',
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    })
  }
}

export async function updatePostInSheet(config: SheetConfig, postId: string, updates: Record<string, string>) {
  const sheets = getSheets(config.serviceAccountKey)

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: '貼文!A:V',
  })

  const rows = result.data.values
  if (!rows) return

  const rowIndex = rows.findIndex(r => r[0] === postId)
  if (rowIndex < 0) return

  const row = rows[rowIndex]
  const updated = [
    updates.id ?? row[0], updates.accountId ?? row[1], updates.accountName ?? row[2],
    updates.title ?? row[3], updates.contentText ?? row[4], updates.platforms ?? row[5],
    updates.formula ?? row[6], updates.dayNumber ?? row[7], updates.status ?? row[8],
    updates.scheduledAt ?? row[9], updates.publishedAt ?? row[10],
    updates.likes ?? row[11], updates.comments ?? row[12], updates.shares ?? row[13],
    updates.reach ?? row[14], updates.nonFollowerPct ?? row[15],
    updates.aiGenerated ?? row[16], updates.aiProvider ?? row[17],
    updates.notes ?? row[18], updates.createdAt ?? row[19], updates.updatedAt ?? row[20],
    updates.platformPostId ?? row[21] ?? '',
  ]

  await sheets.spreadsheets.values.update({
    spreadsheetId: config.spreadsheetId,
    range: `貼文!A${rowIndex + 1}:V${rowIndex + 1}`,
    valueInputOption: 'RAW',
    requestBody: { values: [updated] },
  })
}

export async function getAllPosts(config: SheetConfig) {
  const sheets = getSheets(config.serviceAccountKey)
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: '貼文!A:V',
  })
  return result.data.values ?? []
}

// ── Accounts ───────────────────────────────────────────────────────

export async function upsertAccount(config: SheetConfig, acc: Record<string, string>) {
  const sheets = getSheets(config.serviceAccountKey)
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: '帳號!A:A',
  })
  const ids = result.data.values ?? []
  const rowIndex = ids.findIndex(r => r[0] === acc.id)

  const row = [
    acc.id, acc.platform, acc.accountName, acc.displayName,
    acc.postsPerWeek || '', acc.postsPerDay || '', acc.preferredTimes || '',
    acc.isActive || 'true', acc.createdAt || '',
    acc.apiKeysJson || '', acc.scheduleRulesJson || '',
  ]

  if (rowIndex >= 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.spreadsheetId,
      range: `帳號!A${rowIndex + 1}:K${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    })
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: '帳號!A:K',
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    })
  }
}

export async function getAllAccounts(config: SheetConfig) {
  const sheets = getSheets(config.serviceAccountKey)
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: '帳號!A:K',
  })
  return result.data.values ?? []
}

export async function deleteAccountFromSheet(config: SheetConfig, accountId: string) {
  const sheets = getSheets(config.serviceAccountKey)
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: '帳號!A:A',
  })
  const ids = result.data.values ?? []
  const rowIndex = ids.findIndex(r => r[0] === accountId)
  if (rowIndex < 1) return

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: config.spreadsheetId })
  const sheetId = spreadsheet.data.sheets?.find(s => s.properties?.title === '帳號')?.properties?.sheetId
  if (sheetId == null) return

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: config.spreadsheetId,
    requestBody: {
      requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 } } }],
    },
  })
}

// ── Style Profiles ─────────────────────────────────────────────────

export async function upsertStyleProfile(config: SheetConfig, sp: Record<string, string>) {
  const sheets = getSheets(config.serviceAccountKey)
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: '口吻設定!A:A',
  })
  const ids = result.data.values ?? []
  const rowIndex = ids.findIndex(r => r[0] === sp.id)

  const row = [
    sp.id, sp.accountId, sp.name, sp.toneSummary,
    sp.samplePosts || '', sp.targetAudience || '',
    sp.hashtagPrefs || '', sp.avoidWords || '', sp.customInstructions || '',
  ]

  if (rowIndex >= 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.spreadsheetId,
      range: `口吻設定!A${rowIndex + 1}:I${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    })
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: '口吻設定!A:I',
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    })
  }
}

export async function getAllStyleProfiles(config: SheetConfig) {
  const sheets = getSheets(config.serviceAccountKey)
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: '口吻設定!A:I',
  })
  return result.data.values ?? []
}

export async function deleteStyleProfileFromSheet(config: SheetConfig, profileId: string) {
  const sheets = getSheets(config.serviceAccountKey)
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: '口吻設定!A:A',
  })
  const ids = result.data.values ?? []
  const rowIndex = ids.findIndex(r => r[0] === profileId)
  if (rowIndex < 1) return

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: config.spreadsheetId })
  const sheetId = spreadsheet.data.sheets?.find(s => s.properties?.title === '口吻設定')?.properties?.sheetId
  if (sheetId == null) return

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: config.spreadsheetId,
    requestBody: {
      requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 } } }],
    },
  })
}
