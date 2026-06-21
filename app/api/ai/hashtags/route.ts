import { NextResponse } from 'next/server'

interface HashtagRequest {
  provider: 'openai' | 'anthropic' | 'google'
  apiKey: string
  model: string
  content: string
  platform: string
  language?: string
}

function buildSystemPrompt(platform: string, language?: string): string {
  const lang = language ?? 'zh-TW'
  const isChineseContent = lang.startsWith('zh')

  const platformGuides: Record<string, string> = {
    facebook:
      'Facebook 上 hashtag 使用較少（3-5 個），偏向主題標記和活動標記。選擇較寬泛、有搜尋量的標籤。',
    instagram:
      'Instagram 上 hashtag 是主要曝光管道，建議 8-12 個。混合使用：2-3 個大熱門標籤（百萬級貼文）、3-4 個中等標籤（十萬級）、3-4 個精準利基標籤。',
    threads:
      'Threads 上 hashtag 使用極少，建議 1-3 個最核心的標籤即可。選擇最精準的話題標籤。',
    x: 'X/Twitter 上建議 1-3 個 hashtag。選擇當前熱門或精準的話題標籤，不要過多以免影響閱讀。',
  }

  const parts: string[] = [
    'You are a social media hashtag strategist.',
    `Analyze the given post content and suggest 8-12 highly relevant hashtags for the "${platform}" platform.`,
  ]

  const platformKey = platform.toLowerCase()
  if (platformGuides[platformKey]) {
    parts.push(`Platform-specific guidance: ${platformGuides[platformKey]}`)
  }

  parts.push(
    'Strategy for hashtag selection:',
    '- Mix popular/broad hashtags with niche/specific ones for maximum reach',
    '- Include hashtags that match the post topic, industry, and target audience',
    '- Consider trending and seasonal hashtags when relevant',
    '- Avoid banned or shadowbanned hashtags',
  )

  if (isChineseContent) {
    parts.push(
      'The content is in Chinese. Provide hashtags primarily in Chinese, with a few English hashtags if they are commonly used in this niche (e.g., #OOTD, #foodie).',
    )
  }

  parts.push(
    'IMPORTANT: Return ONLY a JSON array of hashtag strings (without the # symbol). Example: ["社群行銷", "數位轉型", "marketing"]',
    'Do not include any explanation, markdown formatting, or text outside the JSON array.',
  )

  return parts.join('\n\n')
}

async function callOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error?.error?.message || `OpenAI API error: ${response.status}`,
    )
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() ?? '[]'
}

async function callAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error?.error?.message || `Anthropic API error: ${response.status}`,
    )
  }

  const data = await response.json()
  const textBlock = data.content?.find(
    (block: { type: string }) => block.type === 'text',
  )
  return textBlock?.text?.trim() ?? '[]'
}

async function callGoogle(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error?.error?.message || `Google AI API error: ${response.status}`,
    )
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '[]'
}

function parseHashtags(raw: string): string[] {
  // Strip markdown code fences if present
  let cleaned = raw.replace(/```json?\s*/g, '').replace(/```/g, '').trim()

  // Try to extract a JSON array from the response
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/)
  if (arrayMatch) {
    cleaned = arrayMatch[0]
  }

  try {
    const parsed = JSON.parse(cleaned)
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item): item is string => typeof item === 'string')
        .map((tag) => tag.replace(/^#/, '').trim())
        .filter((tag) => tag.length > 0)
    }
  } catch {
    // Fallback: split by newlines or commas
    return cleaned
      .split(/[\n,]+/)
      .map((tag) => tag.replace(/^[\s#-]*/, '').trim())
      .filter((tag) => tag.length > 0 && !tag.startsWith('['))
  }

  return []
}

export async function POST(request: Request) {
  try {
    const body: HashtagRequest = await request.json()

    if (!body.provider || !body.apiKey || !body.model || !body.content || !body.platform) {
      return NextResponse.json(
        { error: 'Missing required fields: provider, apiKey, model, content, platform' },
        { status: 400 },
      )
    }

    if (!['openai', 'anthropic', 'google'].includes(body.provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be one of: openai, anthropic, google' },
        { status: 400 },
      )
    }

    const systemPrompt = buildSystemPrompt(body.platform, body.language)
    const userPrompt = `Please suggest relevant hashtags for the following post content:\n\n${body.content}`

    let rawResponse: string

    switch (body.provider) {
      case 'openai':
        rawResponse = await callOpenAI(body.apiKey, body.model, systemPrompt, userPrompt)
        break
      case 'anthropic':
        rawResponse = await callAnthropic(body.apiKey, body.model, systemPrompt, userPrompt)
        break
      case 'google':
        rawResponse = await callGoogle(body.apiKey, body.model, systemPrompt, userPrompt)
        break
    }

    const hashtags = parseHashtags(rawResponse)

    return NextResponse.json({ hashtags })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    console.error('[Hashtag API Error]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
