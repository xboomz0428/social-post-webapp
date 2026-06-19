export type Platform = 'facebook' | 'instagram' | 'threads' | 'x'
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed'

export interface PostStats {
  likes?: number
  comments?: number
  shares?: number
  reach?: number
  nonFollowerPct?: number
}

export interface Post {
  id: string
  title: string
  content: string
  contentText: string
  images: string[]
  platforms: Platform[]
  scheduledAt: string | null
  publishedAt: string | null
  status: PostStatus
  dayNumber: number
  formula: string
  notes: string
  stats: PostStats
  createdAt: string
  updatedAt: string
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

export interface InstagramAPIKeys {
  accessToken: string
  pageId: string
  igUserId: string
}

export interface APIKeys {
  threads: ThreadsAPIKeys
  x: XAPIKeys
  instagram: InstagramAPIKeys
}

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
