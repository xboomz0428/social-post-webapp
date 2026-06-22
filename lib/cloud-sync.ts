import type { SocialAccount, Post, StyleProfile, Platform } from './types'

export async function syncAccountToCloud(acc: SocialAccount) {
  try {
    await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert-account',
        account: {
          id: acc.id,
          platform: acc.platform,
          accountName: acc.accountName,
          displayName: acc.displayName,
          postsPerWeek: String(acc.scheduleRules.postsPerWeek),
          postsPerDay: String(acc.scheduleRules.postsPerDay),
          preferredTimes: acc.scheduleRules.preferredTimes.join(','),
          isActive: String(acc.isActive),
          createdAt: acc.createdAt,
          apiKeysJson: JSON.stringify(acc.apiKeys),
          scheduleRulesJson: JSON.stringify(acc.scheduleRules),
        },
      }),
    })
  } catch {}
}

export async function deleteAccountFromCloud(accountId: string) {
  try {
    await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete-account', accountId }),
    })
  } catch {}
}

export async function syncStyleToCloud(sp: StyleProfile) {
  try {
    await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert-style',
        style: {
          id: sp.id,
          accountId: sp.accountId,
          name: sp.name,
          toneSummary: sp.toneSummary,
          samplePosts: JSON.stringify(sp.samplePosts),
          targetAudience: sp.targetAudience,
          hashtagPrefs: sp.hashtagPrefs.join(','),
          avoidWords: sp.avoidWords.join(','),
          customInstructions: sp.customInstructions,
        },
      }),
    })
  } catch {}
}

export async function deleteStyleFromCloud(styleId: string) {
  try {
    await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete-style', styleId }),
    })
  } catch {}
}

export interface CloudData {
  accounts: SocialAccount[]
  posts: Post[]
  styles: StyleProfile[]
}

export async function pullAllFromCloud(): Promise<CloudData | null> {
  try {
    const res = await fetch('/api/sheets?type=all')
    const data = await res.json()
    if (!data.success) return null

    const accounts = parseAccountRows(data.accounts || [])
    const posts = parsePostRows(data.posts || [])
    const styles = parseStyleRows(data.styles || [])

    return { accounts, posts, styles }
  } catch {
    return null
  }
}

function parseAccountRows(rows: string[][]): SocialAccount[] {
  if (rows.length <= 1) return []
  return rows.slice(1).filter(r => r[0]).map(r => {
    let apiKeys = { platform: (r[1] || 'facebook') as Platform, keys: {} }
    try { apiKeys = JSON.parse(r[9] || '{}') } catch {}

    let scheduleRules = { postsPerWeek: 3, postsPerDay: 1, preferredTimes: ['09:00'], activeDays: [1,2,3,4,5] }
    try { scheduleRules = JSON.parse(r[10] || '{}') } catch {}

    return {
      id: r[0],
      platform: (r[1] || 'facebook') as Platform,
      accountName: r[2] || '',
      displayName: r[3] || '',
      apiKeys,
      styleProfileId: null,
      scheduleRules,
      isActive: r[7] !== 'false',
      createdAt: r[8] || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as SocialAccount
  })
}

function parsePostRows(rows: string[][]): Post[] {
  if (rows.length <= 1) return []
  return rows.slice(1).filter(r => r[0]).map(r => ({
    id: r[0],
    accountId: r[1] || '',
    title: r[3] || '',
    content: `<p>${(r[4] || '').replace(/\n/g, '</p><p>')}</p>`,
    contentText: r[4] || '',
    images: [],
    platforms: (r[5] || '').split(',').map(s => s.trim()).filter(Boolean) as Platform[],
    formula: r[6] || '',
    dayNumber: Number(r[7]) || 0,
    scheduledAt: r[9] || null,
    publishedAt: r[10] || null,
    status: (r[8] || 'draft') as Post['status'],
    notes: r[18] || '',
    stats: {
      likes: Number(r[11]) || undefined,
      comments: Number(r[12]) || undefined,
      shares: Number(r[13]) || undefined,
      reach: Number(r[14]) || undefined,
      nonFollowerPct: Number(r[15]) || undefined,
    },
    aiGenerated: r[16] === 'true',
    aiProvider: r[17] as Post['aiProvider'] || null,
    platformPostId: r[21] || null,
    createdAt: r[19] || new Date().toISOString(),
    updatedAt: r[20] || new Date().toISOString(),
  }))
}

function parseStyleRows(rows: string[][]): StyleProfile[] {
  if (rows.length <= 1) return []
  return rows.slice(1).filter(r => r[0]).map(r => {
    let samplePosts: string[] = []
    try { samplePosts = JSON.parse(r[4] || '[]') } catch { samplePosts = (r[4] || '').split('\n').filter(Boolean) }

    return {
      id: r[0],
      accountId: r[1] || '',
      name: r[2] || '',
      toneSummary: r[3] || '',
      samplePosts,
      targetAudience: r[5] || '',
      hashtagPrefs: (r[6] || '').split(',').filter(Boolean),
      avoidWords: (r[7] || '').split(',').filter(Boolean),
      customInstructions: r[8] || '',
    }
  })
}
