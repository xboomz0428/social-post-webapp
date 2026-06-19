'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPost, savePost } from '@/lib/storage'
import { Platform, Post } from '@/lib/types'
import PostForm from '@/components/PostForm'
import { toast } from 'sonner'

export default function NewEditorPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  async function handleSave(data: Partial<Post>) {
    setSaving(true)
    const post = createPost(data)
    savePost(post)
    toast.success('貼文已儲存')
    router.push('/')
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">新增貼文</h1>
        <p className="text-gray-500 text-sm mt-1">編輯內容、選擇平台、設定排程時間</p>
      </div>
      <PostForm onSave={handleSave} saving={saving} />
    </div>
  )
}
