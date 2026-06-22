import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey, prompt, size = '1024x1024', style = 'vivid' } = await req.json()

    if (!apiKey) {
      return NextResponse.json({ error: '缺少 API Key' }, { status: 400 })
    }
    if (!prompt) {
      return NextResponse.json({ error: '缺少圖片描述' }, { status: 400 })
    }

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size,
          style,
          response_format: 'url',
        }),
      })
      const data = await res.json()
      if (data.error) {
        return NextResponse.json({ error: data.error.message }, { status: 400 })
      }
      return NextResponse.json({
        url: data.data[0].url,
        revisedPrompt: data.data[0].revised_prompt,
      })
    }

    if (provider === 'google') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Generate an image: ${prompt}` }] }],
            generationConfig: { responseModalities: ['TEXT'] },
          }),
        }
      )
      const data = await res.json()
      if (data.error) {
        return NextResponse.json({ error: data.error.message || 'Gemini 圖片生成失敗' }, { status: 400 })
      }
      return NextResponse.json({
        error: 'Google Gemini 目前不支援直接圖片生成，建議使用 OpenAI DALL-E',
      }, { status: 400 })
    }

    return NextResponse.json({ error: `不支援 ${provider} 的圖片生成，僅支援 OpenAI (DALL-E 3)` }, { status: 400 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '圖片生成失敗' },
      { status: 500 }
    )
  }
}
