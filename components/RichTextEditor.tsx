'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { useEffect, useRef, useState } from 'react'
import {
  Bold, Italic, List, ListOrdered, ImageIcon, Minus, Undo, Redo, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  content: string
  onChange: (html: string, text: string) => void
  onImagesChange?: (images: string[]) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, onImagesChange, placeholder }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: placeholder || '開始輸入貼文內容...' }),
      CharacterCount,
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML(), editor.getText())
      if (onImagesChange) {
        const imgs: string[] = []
        editor.state.doc.descendants(node => {
          if (node.type.name === 'image') imgs.push(node.attrs.src)
        })
        onImagesChange(imgs)
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[240px] px-4 py-3 focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  function insertImage(src: string) {
    editor?.chain().focus().setImage({ src }).run()
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success && data.url) {
        insertImage(data.url)
      } else {
        const reader = new FileReader()
        reader.onload = ev => {
          if (ev.target?.result) insertImage(ev.target.result as string)
        }
        reader.readAsDataURL(file)
      }
    } catch {
      const reader = new FileReader()
      reader.onload = ev => {
        if (ev.target?.result) insertImage(ev.target.result as string)
      }
      reader.readAsDataURL(file)
    }
    setUploading(false)
  }

  if (!editor) return null

  const toolbarBtns = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), title: '粗體' },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), title: '斜體' },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), title: '條列' },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), title: '編號' },
    { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), active: false, title: '分隔線' },
    { icon: Undo, action: () => editor.chain().focus().undo().run(), active: false, title: '復原' },
    { icon: Redo, action: () => editor.chain().focus().redo().run(), active: false, title: '重做' },
  ]

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b bg-gray-50 flex-wrap">
        {toolbarBtns.map(({ icon: Icon, action, active, title }) => (
          <Button
            key={title}
            type="button"
            variant="ghost"
            size="sm"
            onClick={action}
            className={`h-8 w-8 p-0 ${active ? 'bg-gray-200' : ''}`}
            title={title}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 px-2 gap-1 text-xs"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
          {uploading ? '上傳中...' : '插入圖片'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <div className="ml-auto text-xs text-gray-400">
          {editor.storage.characterCount.characters()} 字
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
