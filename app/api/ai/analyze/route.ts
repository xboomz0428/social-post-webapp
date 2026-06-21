import { NextResponse } from 'next/server'

interface PostInput {
  content: string
  formula: string
  stats: { likes: number; comments: number; shares: number; reach: number }
}

interface RequestBody {
  provider: 'openai' | 'anthropic' | 'google'
  apiKey: string
  model: string
  posts: PostInput[]
}

function buildPrompt(posts: PostInput[]): string {
  const rows = posts.map((p, i) => {
    const eng = p.stats.reach > 0
      ? (((p.stats.likes + p.stats.comments + p.stats.shares) / p.stats.reach) * 100).toFixed(1)
      : '0'
    return `${i + 1}. [${p.formula}] 觸及:${p.stats.reach} 讚:${p.stats.likes} 留言:${p.stats.comments} 分享:${p.stats.shares} 互動率:${eng}%\n內容摘要: ${p.content.slice(0, 120)}`
  }).join('\n\n')

  return `你是社群行銷數據分析師。以下是過去的社群貼文表現數據，請分析並提供建議。

## 貼文數據（共 ${posts.length} 篇）

${rows}

## 請分析以下內容（用繁體中文回答）：

1. **公式表現排名**：哪些公式（F1, F2...）表現最好 / 最差？
2. **內容模式觀察**：高互動貼文有哪些共同特徵？
3. **語氣 / 風格觀察**：什麼類型的語氣更容易獲得互動？
4. **具體改善建議**：至少 3 個可執行的改善方向
5. **公式分配建議**：如果接下來要排 14 天的貼文，每個公式建議佔比（權重）是多少？

請在最後以 JSON 格式提供公式權重建議（不要 markdown 代碼塊），格式如下：
FORMULA_WEIGHTS_JSON: [{"formula":"F1","weight":0.3},{"formula":"F2","weight":0.2}]`
}

async function callOpenAI(apiKey: string, model: string, prompt: string) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

async function callAnthropic(apiKey: string, model: string, prompt: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) throw new Error(`Anthropic API error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.content?.[0]?.text ?? ''
}

async function callGoogle(apiKey: string, model: string, prompt: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
      }),
    },
  )
  if (!res.ok) throw new Error(`Google API error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

function parseWeights(text: string): { formula: string; weight: number }[] {
  const marker = 'FORMULA_WEIGHTS_JSON:'
  const idx = text.indexOf(marker)
  if (idx < 0) return []
  const jsonStr = text.slice(idx + marker.length).trim()
  // Find the JSON array
  const start = jsonStr.indexOf('[')
  const end = jsonStr.indexOf(']', start)
  if (start < 0 || end < 0) return []
  try {
    return JSON.parse(jsonStr.slice(start, end + 1))
  } catch {
    return []
  }
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json()
    const { provider, apiKey, model, posts } = body

    if (!apiKey) {
      return NextResponse.json({ error: '缺少 API Key' }, { status: 400 })
    }
    if (!posts || posts.length === 0) {
      return NextResponse.json({ error: '沒有貼文數據可供分析' }, { status: 400 })
    }

    const prompt = buildPrompt(posts)

    let text: string
    switch (provider) {
      case 'openai':
        text = await callOpenAI(apiKey, model, prompt)
        break
      case 'anthropic':
        text = await callAnthropic(apiKey, model, prompt)
        break
      case 'google':
        text = await callGoogle(apiKey, model, prompt)
        break
      default:
        return NextResponse.json({ error: `未知 AI 提供者：${provider}` }, { status: 400 })
    }

    const recommendations = parseWeights(text)
    // Clean the marker from analysis text for display
    const markerIdx = text.indexOf('FORMULA_WEIGHTS_JSON:')
    const analysis = (markerIdx >= 0 ? text.slice(0, markerIdx) : text).trim()

    return NextResponse.json({ analysis, recommendations })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: `分析失敗：${err instanceof Error ? err.message : '未知錯誤'}` },
      { status: 500 },
    )
  }
}
