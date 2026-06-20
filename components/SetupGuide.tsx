'use client'
import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'

interface Step {
  title: string
  detail: string
  link?: { label: string; url: string }
}

interface Props {
  title: string
  steps: Step[]
  defaultOpen?: boolean
}

export default function SetupGuide({ title, steps, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border rounded-lg bg-amber-50/50 border-amber-200">
      <button
        type="button"
        className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm font-medium text-amber-800 hover:bg-amber-50 transition-colors rounded-lg"
        onClick={() => setOpen(o => !o)}
      >
        {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
        📖 {title}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <div className="text-sm">
                <div className="font-medium text-gray-800">{step.title}</div>
                <div className="text-gray-600 mt-0.5 whitespace-pre-line">{step.detail}</div>
                {step.link && (
                  <a
                    href={step.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-1 text-xs"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {step.link.label}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
