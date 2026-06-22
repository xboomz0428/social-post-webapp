'use client'
import { useEffect, useState } from 'react'
import { pullAllFromCloud } from '@/lib/cloud-sync'
import { getAccounts, saveAccount, getPosts, savePost, getStyleProfilesByAccount, saveStyleProfile } from '@/lib/storage'
import { toast } from 'sonner'

export default function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    if (synced) return
    const lastSync = sessionStorage.getItem('cloud_sync_done')
    if (lastSync) { setSynced(true); return }

    async function sync() {
      try {
        const cloud = await pullAllFromCloud()
        if (!cloud) { setSynced(true); return }

        let imported = 0

        // Merge accounts: cloud wins for accounts not in localStorage
        const localAccounts = getAccounts()
        const localAccountIds = new Set(localAccounts.map(a => a.id))
        for (const acc of cloud.accounts) {
          if (!localAccountIds.has(acc.id)) {
            saveAccount(acc)
            imported++
          }
        }

        // Merge posts
        const localPosts = getPosts()
        const localPostIds = new Set(localPosts.map(p => p.id))
        for (const post of cloud.posts) {
          if (!localPostIds.has(post.id)) {
            savePost(post)
            imported++
          } else {
            const local = localPosts.find(p => p.id === post.id)
            if (local && post.updatedAt > local.updatedAt) {
              savePost({ ...local, ...post })
            }
          }
        }

        // Merge style profiles
        const allAccIds = [...new Set([...cloud.accounts.map(a => a.id), ...localAccounts.map(a => a.id)])]
        for (const accId of allAccIds) {
          const localStyles = getStyleProfilesByAccount(accId)
          const localStyleIds = new Set(localStyles.map(s => s.id))
          for (const sp of cloud.styles.filter(s => s.accountId === accId)) {
            if (!localStyleIds.has(sp.id)) {
              saveStyleProfile(sp)
              imported++
            }
          }
        }

        sessionStorage.setItem('cloud_sync_done', Date.now().toString())
        if (imported > 0) {
          toast.success(`已從雲端同步 ${imported} 筆資料`)
          window.location.reload()
        }
      } catch {}
      setSynced(true)
    }

    sync()
  }, [synced])

  return <>{children}</>
}
