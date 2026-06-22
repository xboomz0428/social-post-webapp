'use client'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Smile } from 'lucide-react'

const EMOJI_CATEGORIES = [
  { label: '常用', emojis: ['😀','😂','🤣','😊','😍','🥰','😘','😎','🤩','🥳','😅','😢','😭','🤔','😏','😤','🔥','❤️','👍','👏','🙏','💪','✨','🎉','💯','🚀','💰','📈','👀','💡'] },
  { label: '表情', emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🫢','🤫','🤔','🫡','🤐','🤨','😐','😑','😶','🫥','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐'] },
  { label: '手勢', emojis: ['👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','💪'] },
  { label: '符號', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','💕','💞','💓','💗','💖','💘','💝','💟','⭐','🌟','✨','⚡','🔥','💥','🎯','✅','❌','⭕','💯','📌','🔔','💬','💭','🏷️','📊','📈','📉','💰','💵'] },
  { label: '自然', emojis: ['🌸','🌺','🌻','🌹','🌷','🌱','🌿','☘️','🍀','🍃','🍂','🍁','🌾','🌵','🌴','🎋','🎍','🫧','🌊','💧','☀️','🌤️','⛅','🌈','⭐','🌙','🍎','🍊','🍋','🍇'] },
]

interface Props {
  onSelect: (emoji: string) => void
}

export default function EmojiPicker({ onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        <Smile className="h-3.5 w-3.5" />
        表情符號
      </Button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 bg-white border rounded-lg shadow-xl w-[340px]">
          <div className="flex border-b overflow-x-auto">
            {EMOJI_CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                className={`px-3 py-2 text-xs whitespace-nowrap transition-colors ${
                  activeTab === i ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(i)}
                type="button"
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="p-2 grid grid-cols-8 gap-0.5 max-h-[200px] overflow-y-auto">
            {EMOJI_CATEGORIES[activeTab].emojis.map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                className="w-9 h-9 flex items-center justify-center text-xl hover:bg-gray-100 rounded transition-colors"
                onClick={() => { onSelect(emoji); setOpen(false) }}
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
