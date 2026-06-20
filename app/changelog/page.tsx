import { promises as fs } from 'fs'
import path from 'path'

export default async function ChangelogPage() {
  const content = await fs.readFile(path.join(process.cwd(), 'CHANGELOG.md'), 'utf-8')
  const sections = content.split(/^## /m).filter(Boolean)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">改版記錄</h1>
        <p className="text-gray-500 text-sm mt-1">所有版本更新的紀錄</p>
      </div>
      <div className="space-y-8">
        {sections.map((section, i) => {
          if (section.startsWith('# ')) return null
          const lines = section.split('\n')
          const title = lines[0]?.trim()
          const body = lines.slice(1).join('\n').trim()
          return (
            <div key={i} className="border-l-2 border-blue-400 pl-4">
              <h2 className="text-lg font-semibold">{title}</h2>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                {body.split('\n').map((line, j) => {
                  if (line.startsWith('### ')) return <h3 key={j} className="font-medium text-gray-800 mt-3">{line.replace('### ', '')}</h3>
                  if (line.startsWith('- ')) return <p key={j} className="ml-2">{line}</p>
                  if (line.startsWith('---')) return <hr key={j} className="my-4" />
                  if (line.trim()) return <p key={j}>{line}</p>
                  return null
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
