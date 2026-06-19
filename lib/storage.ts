import { Post, APIKeys } from './types'

const POSTS_KEY = 'social_posts'
const APIKEYS_KEY = 'social_apikeys'

export function getPosts(): Post[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(POSTS_KEY) || '[]')
  } catch {
    return []
  }
}

export function getPost(id: string): Post | null {
  return getPosts().find(p => p.id === id) ?? null
}

export function savePost(post: Post): void {
  const posts = getPosts()
  const idx = posts.findIndex(p => p.id === post.id)
  if (idx >= 0) {
    posts[idx] = { ...post, updatedAt: new Date().toISOString() }
  } else {
    posts.push(post)
  }
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
}

export function deletePost(id: string): void {
  const posts = getPosts().filter(p => p.id !== id)
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
}

export function createPost(partial: Partial<Post> = {}): Post {
  return {
    id: crypto.randomUUID(),
    title: '',
    content: '',
    contentText: '',
    images: [],
    platforms: [],
    scheduledAt: null,
    publishedAt: null,
    status: 'draft',
    dayNumber: 0,
    formula: '',
    notes: '',
    stats: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...partial,
  }
}

export function getAPIKeys(): APIKeys {
  if (typeof window === 'undefined') {
    return defaultAPIKeys()
  }
  try {
    return JSON.parse(localStorage.getItem(APIKEYS_KEY) || 'null') ?? defaultAPIKeys()
  } catch {
    return defaultAPIKeys()
  }
}

export function saveAPIKeys(keys: APIKeys): void {
  localStorage.setItem(APIKEYS_KEY, JSON.stringify(keys))
}

function defaultAPIKeys(): APIKeys {
  return {
    threads: { accessToken: '', userId: '' },
    x: { apiKey: '', apiSecret: '', accessToken: '', accessSecret: '' },
    instagram: { accessToken: '', pageId: '', igUserId: '' },
  }
}
