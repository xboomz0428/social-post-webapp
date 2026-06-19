'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getPost, savePost } from '@/lib/storage'
import { Post } from '@/lib/types'
import PostForm from '@/components/PostForm'
import { toast } from 'sonner'

export default function EditEditorPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const p = getPost(id)
    if (!p) { router.push('/'); return }
    setPost(p)
  }, [id, router])

  async function handleSave(data: Partial<Post>) {
    if (!post) return
    setSaving(true)
    savePost({ ...post, ...data, updatedAt: new Date().toISOString() })
    toast.success('貼文已更新')
    router.push('/')
  }

  if (!post) return <div className="text-center py-20 text-gray-400">載入中...</div>

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">編輯貼文</h1>
        <p className="text-gray-500 text-sm mt-1">修改內容或排程設定</p>
      </div>
      <PostForm initialData={post} onSave={handleSave} saving={saving} />
    </div>
  )
}
