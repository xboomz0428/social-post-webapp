// ── Platform & Status enums ──────────────────────────────────────────

export type Platform = 'facebook' | 'instagram' | 'threads' | 'x'
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed'
export type AIProvider = 'openai' | 'anthropic' | 'google'

// ── Platform-specific API key shapes ────────────────────────────────

export interface FacebookAPIKeys {
  accessToken: string
  pageId: string
}

export interface InstagramAPIKeys {
  accessToken: string
  pageId: string
  igUserId: string
}

export interface ThreadsAPIKeys {
  accessToken: string
  userId: string
}

export interface XAPIKeys {
  apiKey: string
  apiSecret: string
  accessToken: string
  accessSecret: string
}

export type PlatformAPIKeys =
  | { platform: 'facebook'; keys: FacebookAPIKeys }
  | { platform: 'instagram'; keys: InstagramAPIKeys }
  | { platform: 'threads'; keys: ThreadsAPIKeys }
  | { platform: 'x'; keys: XAPIKeys }

// ── Schedule & Style ────────────────────────────────────────────────

export interface ScheduleRule {
  postsPerWeek: number
  postsPerDay: number
  preferredTimes: string[]   // HH:mm format
  activeDays: number[]       // 0=Sun ... 6=Sat
}

export interface StyleProfile {
  id: string
  accountId: string
  name: string
  toneSummary: string
  samplePosts: string[]
  targetAudience: string
  hashtagPrefs: string[]
  avoidWords: string[]
  customInstructions: string
}

// ── Social Account ──────────────────────────────────────────────────

export interface SocialAccount {
  id: string
  platform: Platform
  accountName: string        // internal label, e.g. "@mybrand_ig"
  displayName: string        // public-facing name
  apiKeys: PlatformAPIKeys
  styleProfileId: string | null
  scheduleRules: ScheduleRule
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ── Post Stats ──────────────────────────────────────────────────────

export interface PostStats {
  likes?: number
  comments?: number
  shares?: number
  reach?: number
  nonFollowerPct?: number
}

// ── Post ────────────────────────────────────────────────────────────

export interface Post {
  id: string
  accountId: string          // which SocialAccount this post belongs to
  title: string
  content: string            // HTML rich text
  contentText: string        // plain-text version
  images: string[]           // URLs or base64
  platforms: Platform[]
  scheduledAt: string | null
  publishedAt: string | null
  status: PostStatus
  formula: string            // formula code, e.g. "F1"
  dayNumber: number          // day within a content calendar cycle
  notes: string
  stats: PostStats
  aiGenerated: boolean
  aiProvider: AIProvider | null
  createdAt: string
  updatedAt: string
}

// ── AI Configuration ────────────────────────────────────────────────

export interface AIProviderConfig {
  apiKey: string
  model: string
  temperature: number
}

export interface AIConfig {
  openai: AIProviderConfig
  anthropic: AIProviderConfig
  google: AIProviderConfig
  activeProvider: AIProvider
}

// ── Formula Templates ───────────────────────────────────────────────

export type FormulaCategory =
  | 'storytelling'
  | 'engagement'
  | 'educational'
  | 'promotional'
  | 'personal'
  | 'community'

export interface FormulaTemplate {
  id: string
  code: string               // "F1", "F2", ... "F27"
  name: string
  description: string
  skeleton: string            // template structure / prompt scaffold
  targetPlatforms: Platform[]
  complexity: 1 | 2 | 3 | 4 | 5
  category: FormulaCategory
}

// ── App Settings ────────────────────────────────────────────────────

export interface AppSettings {
  googleSheetId: string
  googleServiceAccountEmail: string
  activeAccountId: string | null
}

// ── Label & Color constants ─────────────────────────────────────────

export const PLATFORM_LABELS: Record<Platform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  threads: 'Threads',
  x: 'X (Twitter)',
}

export const PLATFORM_COLORS: Record<Platform, string> = {
  facebook: 'bg-blue-600',
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  threads: 'bg-black',
  x: 'bg-black',
}

export const STATUS_LABELS: Record<PostStatus, string> = {
  draft: '草稿',
  scheduled: '已排程',
  published: '已發佈',
  failed: '發佈失敗',
}

export const STATUS_COLORS: Record<PostStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
}

export const AI_PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic (Claude)',
  google: 'Google (Gemini)',
}

// ── Legacy compat (used by settings page until it is rewritten) ─────

/** @deprecated Use SocialAccount.apiKeys instead */
export interface APIKeys {
  threads: ThreadsAPIKeys
  x: XAPIKeys
  instagram: InstagramAPIKeys
}

export const AI_MODELS: Record<AIProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1'],
  anthropic: ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
  google: ['gemini-2.5-flash', 'gemini-2.5-pro'],
}
