import { NextResponse } from 'next/server'

const COMPLIANCE_SYSTEM_PROMPT = `你是台灣法規文案合規審查專家。請審查以下社群貼文是否違反台灣相關法規。

審查法規範圍：
1. 《藥事法》第 68、69 條 — 非藥品不得宣稱醫藥效能
2. 《食品安全衛生管理法》第 28 條 — 食品廣告不得有不實誇張或宣稱療效
3. 《化粧品衛生安全管理法》第 10 條 — 化粧品不得宣稱醫療效能
4. 《公平交易法》第 21 條 — 廣告不得虛偽不實或引人錯誤
5. 《健康食品管理法》— 未經認證不得使用「健康食品」四字

常見違規關鍵詞（若出現請標記）：
- 直接療效：治療、治癒、痊癒、根治、消除病灶、醫治
- 暗示療效：改善（疾病名）、預防（疾病名）、降血壓、降血糖、降膽固醇、抗癌、防癌、消炎、止痛、排毒、殺菌
- 誇大用語：100% 有效、保證見效、一次見效、永久、根除、立即見效、神奇、奇蹟
- 醫學用語：臨床實證、醫學證實、醫師推薦（無授權）、處方級、藥用級
- 身體功能宣稱（食品禁用）：增強免疫力、改善腸胃、保護肝臟、強化骨骼

請以 JSON 格式回覆，格式如下：
{
  "pass": true/false,
  "riskLevel": "safe" | "warning" | "violation",
  "issues": [
    {
      "text": "原文中的違規片段",
      "law": "違反的法規名稱",
      "reason": "為什麼違規",
      "suggestion": "建議修改為"
    }
  ],
  "summary": "一句話總結審查結果"
}

如果文案完全合規，issues 為空陣列，riskLevel 為 "safe"。
如果有灰色地帶（不確定是否違規），riskLevel 為 "warning"。
如果有明確違規，riskLevel 為 "violation"。
只回覆 JSON，不要其他文字。`

interface ComplianceRequest {
  provider: 'openai' | 'anthropic' | 'google'
  apiKey: string
  model: string
  content: string
}

async function callAI(provider: string, apiKey: string, model: string, content: string) {
  const userPrompt = `請審查以下社群貼文的法規合規性：\n\n${content}`

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        messages: [
          { role: 'system', content: COMPLIANCE_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error.message)
    return data.choices?.[0]?.message?.content?.trim() ?? ''
  }

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        temperature: 0.1,
        system: COMPLIANCE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error.message)
    const textBlock = data.content?.find((b: { type: string }) => b.type === 'text')
    return textBlock?.text?.trim() ?? ''
  }

  if (provider === 'google') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: COMPLIANCE_SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.1 },
      }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error.message)
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
  }

  throw new Error(`不支援的 provider: ${provider}`)
}

export async function POST(request: Request) {
  try {
    const body: ComplianceRequest = await request.json()

    if (!body.apiKey || !body.content) {
      return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 })
    }

    const raw = await callAI(body.provider, body.apiKey, body.model, body.content)

    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: '合規檢查回傳格式錯誤', raw }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '合規檢查失敗' },
      { status: 500 },
    )
  }
}
