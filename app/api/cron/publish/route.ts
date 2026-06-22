import { NextResponse } from 'next/server'
import { getAllPosts, updatePostInSheet, type SheetConfig } from '@/lib/google-sheets'

export const maxDuration = 60

// Column indices in the Google Sheet (0-based, matching the headers in google-sheets.ts)
const COL = {
  ID: 0,
  ACCOUNT_ID: 1,
  ACCOUNT_NAME: 2,
  TITLE: 3,
  CONTENT: 4,
  PLATFORMS: 5,
  FORMULA: 6,
  DAY: 7,
  STATUS: 8,
  SCHEDULED_AT: 9,
  PUBLISHED_AT: 10,
} as const

interface PublishResult {
  postId: string
  platform: string
  success: boolean
  message: string
}

function getSheetConfig(): SheetConfig | null {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!spreadsheetId || !serviceAccountKey) return null
  return { spreadsheetId, serviceAccountKey }
}

async function publishToplatform(
  platform: string,
  content: string,
  apiKeys: Record<string, string>,
  baseUrl: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${baseUrl}/api/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform,
        content,
        apiKeys,
      }),
    })

    const data = await res.json()
    if (!res.ok || data.error) {
      return {
        success: false,
        message: data.error || `HTTP ${res.status}`,
      }
    }

    return { success: true, message: data.postId || 'published' }
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'unknown error',
    }
  }
}

export async function GET(request: Request) {
  // ── Security: verify CRON_SECRET (header or query param) ───────
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get('authorization')
    const url = new URL(request.url)
    const querySecret = url.searchParams.get('secret')
    const isVercelCron = authHeader === `Bearer ${cronSecret}`
    const isExternalCron = querySecret === cronSecret
    if (!isVercelCron && !isExternalCron) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }
  }

  // ── Get sheet config ────────────────────────────────────────────
  const config = getSheetConfig()
  if (!config) {
    return NextResponse.json(
      {
        error:
          'Google Sheets not configured. Set GOOGLE_SPREADSHEET_ID and GOOGLE_SERVICE_ACCOUNT_KEY.',
      },
      { status: 500 },
    )
  }

  // ── Determine base URL for internal API calls ───────────────────
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`

  try {
    // ── Read all posts from Google Sheets ──────────────────────────
    const rows = await getAllPosts(config)
    if (rows.length <= 1) {
      return NextResponse.json({
        message: 'No posts found in sheet',
        published: 0,
        failed: 0,
        results: [],
      })
    }

    const now = new Date()
    const results: PublishResult[] = []

    // Skip header row (index 0)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.length === 0) continue

      const status = row[COL.STATUS]
      const scheduledAt = row[COL.SCHEDULED_AT]
      const postId = row[COL.ID]
      const content = row[COL.CONTENT]
      const platformsStr = row[COL.PLATFORMS]

      // Only process scheduled posts that are due
      if (status !== 'scheduled' || !scheduledAt) continue

      const scheduledDate = new Date(scheduledAt)
      if (isNaN(scheduledDate.getTime()) || scheduledDate > now) continue

      if (!content || !platformsStr || !postId) continue

      // Parse platforms (comma-separated or JSON array)
      let platforms: string[] = []
      try {
        platforms = JSON.parse(platformsStr)
      } catch {
        platforms = platformsStr.split(',').map((s: string) => s.trim()).filter(Boolean)
      }

      // Publish to each platform
      // NOTE: API keys should be configured per-account. For cron, we rely on
      // the publish endpoint receiving the keys. In a production setup, you'd
      // store encrypted keys in a database or secret manager. For now, the cron
      // attempts to publish using the platform's env-based configuration.
      let allSucceeded = true

      for (const platform of platforms) {
        // Build apiKeys from environment variables for each platform
        const apiKeys = getApiKeysFromEnv(platform)

        const result = await publishToplatform(
          platform,
          content,
          apiKeys,
          baseUrl,
        )

        results.push({
          postId,
          platform,
          success: result.success,
          message: result.message,
        })

        if (!result.success) {
          allSucceeded = false
        }
      }

      // Update post status in Google Sheets
      const newStatus = allSucceeded ? 'published' : 'failed'
      const nowISO = now.toISOString()

      await updatePostInSheet(config, postId, {
        status: newStatus,
        publishedAt: allSucceeded ? nowISO : '',
        updatedAt: nowISO,
      })
    }

    const publishedCount = results.filter((r) => r.success).length
    const failedCount = results.filter((r) => !r.success).length

    return NextResponse.json({
      message: `Cron completed: ${publishedCount} published, ${failedCount} failed`,
      published: publishedCount,
      failed: failedCount,
      results,
      timestamp: now.toISOString(),
    })
  } catch (err) {
    console.error('[Cron Publish Error]', err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

/**
 * Retrieve platform API keys from environment variables.
 * In production, these would come from a secret manager or database.
 */
function getApiKeysFromEnv(platform: string): Record<string, string> {
  switch (platform) {
    case 'facebook':
      return {
        accessToken: process.env.FACEBOOK_ACCESS_TOKEN || '',
        pageId: process.env.FACEBOOK_PAGE_ID || '',
      }
    case 'instagram':
      return {
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
        igUserId: process.env.INSTAGRAM_USER_ID || '',
      }
    case 'threads':
      return {
        accessToken: process.env.THREADS_ACCESS_TOKEN || '',
        userId: process.env.THREADS_USER_ID || '',
      }
    case 'x':
      return {
        apiKey: process.env.X_API_KEY || '',
        apiSecret: process.env.X_API_SECRET || '',
        accessToken: process.env.X_ACCESS_TOKEN || '',
        accessSecret: process.env.X_ACCESS_SECRET || '',
      }
    default:
      return {}
  }
}
