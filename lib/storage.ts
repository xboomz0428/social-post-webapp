import type {
  Post,
  SocialAccount,
  StyleProfile,
  AIConfig,
  AIProvider,
  AppSettings,
  Platform,
  APIKeys,
} from './types'

// ── Storage keys ────────────────────────────────────────────────────

const KEYS = {
  accounts: 'social_accounts',
  posts: 'social_posts',
  styleProfiles: 'social_style_profiles',
  aiConfig: 'social_ai_config',
  appSettings: 'social_app_settings',
} as const

// ── Helpers ─────────────────────────────────────────────────────────

function isClient(): boolean {
  return typeof window !== 'undefined'
}

function read<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  if (!isClient()) return
  localStorage.setItem(key, JSON.stringify(value))
}

// ── Accounts ────────────────────────────────────────────────────────

export function getAccounts(): SocialAccount[] {
  return read<SocialAccount[]>(KEYS.accounts, [])
}

export function getAccount(id: string): SocialAccount | null {
  return getAccounts().find(a => a.id === id) ?? null
}

export function saveAccount(account: SocialAccount): void {
  const list = getAccounts()
  const idx = list.findIndex(a => a.id === account.id)
  const now = new Date().toISOString()
  if (idx >= 0) {
    list[idx] = { ...account, updatedAt: now }
  } else {
    list.push({ ...account, createdAt: now, updatedAt: now })
  }
  write(KEYS.accounts, list)
}

export function deleteAccount(id: string): void {
  write(KEYS.accounts, getAccounts().filter(a => a.id !== id))
}

export function createAccount(
  partial: Partial<SocialAccount> & { platform: Platform } = { platform: 'facebook' },
): SocialAccount {
  const now = new Date().toISOString()
  const { platform, ...rest } = partial
  const defaultApiKeys = buildDefaultApiKeys(platform)

  return {
    id: crypto.randomUUID(),
    accountName: '',
    displayName: '',
    apiKeys: defaultApiKeys,
    styleProfileId: null,
    scheduleRules: {
      postsPerWeek: 3,
      postsPerDay: 1,
      preferredTimes: ['09:00', '18:00'],
      activeDays: [1, 2, 3, 4, 5], // Mon-Fri
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...rest,
    platform, // platform always wins
  }
}

function buildDefaultApiKeys(platform: Platform): SocialAccount['apiKeys'] {
  switch (platform) {
    case 'facebook':
      return { platform: 'facebook', keys: { accessToken: '', pageId: '' } }
    case 'instagram':
      return { platform: 'instagram', keys: { accessToken: '', pageId: '', igUserId: '' } }
    case 'threads':
      return { platform: 'threads', keys: { accessToken: '', userId: '' } }
    case 'x':
      return { platform: 'x', keys: { apiKey: '', apiSecret: '', accessToken: '', accessSecret: '' } }
  }
}

// ── Posts ────────────────────────────────────────────────────────────

export function getPosts(accountId?: string): Post[] {
  const all = read<Post[]>(KEYS.posts, [])
  return accountId ? all.filter(p => p.accountId === accountId) : all
}

export function getPost(id: string): Post | null {
  return read<Post[]>(KEYS.posts, []).find(p => p.id === id) ?? null
}

export function savePost(post: Post): void {
  const list = read<Post[]>(KEYS.posts, [])
  const idx = list.findIndex(p => p.id === post.id)
  const now = new Date().toISOString()
  if (idx >= 0) {
    list[idx] = { ...post, updatedAt: now }
  } else {
    list.push(post)
  }
  write(KEYS.posts, list)
}

export function deletePost(id: string): void {
  write(KEYS.posts, read<Post[]>(KEYS.posts, []).filter(p => p.id !== id))
}

export function createPost(partial: Partial<Post> = {}): Post {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    accountId: '',
    title: '',
    content: '',
    contentText: '',
    images: [],
    platforms: [],
    scheduledAt: null,
    publishedAt: null,
    status: 'draft',
    formula: '',
    dayNumber: 0,
    notes: '',
    stats: {},
    aiGenerated: false,
    aiProvider: null,
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

// ── Style Profiles ──────────────────────────────────────────────────

function getStyleProfiles(): StyleProfile[] {
  return read<StyleProfile[]>(KEYS.styleProfiles, [])
}

export function getStyleProfile(accountId: string): StyleProfile | null {
  return getStyleProfiles().find(sp => sp.accountId === accountId) ?? null
}

export function saveStyleProfile(profile: StyleProfile): void {
  const list = getStyleProfiles()
  const idx = list.findIndex(sp => sp.id === profile.id)
  if (idx >= 0) {
    list[idx] = profile
  } else {
    list.push(profile)
  }
  write(KEYS.styleProfiles, list)
}

export function createStyleProfile(
  accountId: string,
  partial: Partial<StyleProfile> = {},
): StyleProfile {
  return {
    id: crypto.randomUUID(),
    accountId,
    name: '',
    toneSummary: '',
    samplePosts: [],
    targetAudience: '',
    hashtagPrefs: [],
    avoidWords: [],
    customInstructions: '',
    ...partial,
  }
}

// ── AI Config ───────────────────────────────────────────────────────

function defaultAIConfig(): AIConfig {
  return {
    openai: { apiKey: '', model: 'gpt-4o', temperature: 0.7 },
    anthropic: { apiKey: '', model: 'claude-sonnet-4-6', temperature: 0.7 },
    google: { apiKey: '', model: 'gemini-2.5-flash', temperature: 0.7 },
    activeProvider: 'google' as AIProvider,
  }
}

export function getAIConfig(): AIConfig {
  return read<AIConfig>(KEYS.aiConfig, defaultAIConfig())
}

export function saveAIConfig(config: AIConfig): void {
  write(KEYS.aiConfig, config)
}

// ── App Settings ────────────────────────────────────────────────────

function defaultAppSettings(): AppSettings {
  return {
    googleSheetId: '',
    googleServiceAccountEmail: '',
    activeAccountId: null,
  }
}

export function getAppSettings(): AppSettings {
  return read<AppSettings>(KEYS.appSettings, defaultAppSettings())
}

export function saveAppSettings(settings: AppSettings): void {
  write(KEYS.appSettings, settings)
}

// ── Legacy compat (settings page still uses the old flat APIKeys) ───

const LEGACY_APIKEYS_KEY = 'social_apikeys'

/** @deprecated Use per-account apiKeys via SocialAccount instead */
export function getAPIKeys(): APIKeys {
  const fallback: APIKeys = {
    threads: { accessToken: '', userId: '' },
    x: { apiKey: '', apiSecret: '', accessToken: '', accessSecret: '' },
    instagram: { accessToken: '', pageId: '', igUserId: '' },
  }
  return read<APIKeys>(LEGACY_APIKEYS_KEY, fallback)
}

/** @deprecated Use saveAccount() instead */
export function saveAPIKeys(keys: APIKeys): void {
  write(LEGACY_APIKEYS_KEY, keys)
}
