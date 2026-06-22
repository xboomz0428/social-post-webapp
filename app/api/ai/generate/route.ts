import { NextResponse } from 'next/server';

interface StyleProfile {
  toneSummary: string;
  samplePosts: string[];
  targetAudience: string;
  customInstructions?: string;
}

interface Formula {
  name: string;
  skeleton: string;
  description: string;
}

interface GenerateRequest {
  provider: 'openai' | 'anthropic' | 'google';
  apiKey: string;
  model: string;
  temperature: number;
  prompt: string;
  styleProfile?: StyleProfile;
  formula?: Formula;
  platform: string;
  accountName: string;
}

function buildSystemPrompt(
  platform: string,
  accountName: string,
  styleProfile?: StyleProfile,
  formula?: Formula,
): string {
  const parts: string[] = [];

  parts.push(
    `You are an expert social media content creator writing a post for the "${platform}" platform.`,
    `You are writing on behalf of the account "${accountName}".`,
  );

  // Platform characteristics
  const platformGuides: Record<string, string> = {
    facebook:
      'Facebook favors longer, story-driven posts with emotional hooks. Use line breaks for readability. Hashtags are optional and should be minimal (0-3).',
    instagram:
      'Instagram captions should be engaging and conversational. Front-load the hook in the first line. Use relevant hashtags (5-15) at the end. Emojis are welcome but not excessive.',
    threads:
      'Threads posts are conversational and concise (under 500 characters ideally). Think Twitter-like brevity with a warmer, more personal tone. Minimal or no hashtags.',
    twitter:
      'Twitter/X posts must be concise (under 280 characters). Be punchy, witty, or thought-provoking. Use 1-3 hashtags maximum.',
    linkedin:
      'LinkedIn posts should be professional yet personable. Use line breaks and whitespace generously. Open with a hook. Tell a story or share an insight. Hashtags at the end (3-5).',
  };

  const platformKey = platform.toLowerCase();
  if (platformGuides[platformKey]) {
    parts.push(`Platform guidelines: ${platformGuides[platformKey]}`);
  }

  // Style profile
  if (styleProfile) {
    if (styleProfile.toneSummary) {
      parts.push(`Writing tone and style: ${styleProfile.toneSummary}`);
    }

    if (styleProfile.samplePosts && styleProfile.samplePosts.length > 0) {
      parts.push(
        'Here are sample posts to match the writing style:',
        ...styleProfile.samplePosts.map(
          (post, i) => `--- Sample ${i + 1} ---\n${post}`,
        ),
        'Write in a style that matches these samples in terms of tone, vocabulary, sentence structure, and personality.',
      );
    }

    if (styleProfile.targetAudience) {
      parts.push(`Target audience: ${styleProfile.targetAudience}`);
    }

    if (styleProfile.customInstructions) {
      parts.push(`Additional instructions: ${styleProfile.customInstructions}`);
    }
  }

  // Formula
  if (formula) {
    parts.push(
      `Use the following content formula as a structural guide:`,
      `Formula: ${formula.name}`,
      `Description: ${formula.description}`,
      `Structure:\n${formula.skeleton}`,
      'Follow this structure but make it feel natural, not formulaic.',
    );
  }

  parts.push(
    `【台灣法規合規要求 — 必須嚴格遵守】
你產出的文案必須完全符合以下台灣法規：

1. 《藥事法》：
   - 禁止宣稱療效、治療、改善疾病（如：治療失眠、降血壓、抗癌、消炎、止痛）
   - 禁止使用醫療用語暗示效果（如：處方、臨床實證、醫學證實）
   - 非藥品不得宣稱任何醫藥效能

2. 《食品安全衛生管理法》：
   - 食品不得宣稱療效或醫藥效能
   - 禁止誇大不實（如：100% 有效、保證見效）
   - 可用「調整體質」「促進新陳代謝」「營養補給」等衛福部核可的保健敘述

3. 《化粧品衛生安全管理法》：
   - 禁止宣稱醫療效能（如：除皺、消炎、治療痘痘）
   - 可用感受性描述（如：感覺更水潤、看起來更亮）

4. 《公平交易法》：
   - 禁止虛偽不實或引人錯誤的廣告
   - 使用見證者推薦需加註「個人體驗，效果因人而異」

安全替代用語規則：
- ✗「治療」→ ✓「保養」「呵護」
- ✗「療效」→ ✓「感受」「體驗」
- ✗「改善失眠」→ ✓「睡前放鬆儀式」
- ✗「降血壓」→ ✓「日常健康管理」
- ✗「消炎止痛」→ ✓「舒緩疲勞感」
- ✗「臨床實證」→ ✓「使用者回饋」
- ✗「100% 有效」→ ✓「許多人推薦」

如果題材涉及草本、保健、食品、美妝類產品，務必用感受性、生活化的描述，絕不碰觸醫療療效宣稱。`,
  );

  parts.push(
    'Output only the post content. Do not include any meta commentary, explanations, labels, or quotation marks wrapping the entire post.',
  );

  return parts.join('\n\n');
}

async function callOpenAI(
  apiKey: string,
  model: string,
  temperature: number,
  systemPrompt: string,
  userPrompt: string,
) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error?.message || `OpenAI API error: ${response.status}`,
    );
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content?.trim() ?? '',
    tokensUsed: data.usage?.total_tokens ?? null,
  };
}

async function callAnthropic(
  apiKey: string,
  model: string,
  temperature: number,
  systemPrompt: string,
  userPrompt: string,
) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error?.message || `Anthropic API error: ${response.status}`,
    );
  }

  const data = await response.json();
  const textBlock = data.content?.find(
    (block: { type: string }) => block.type === 'text',
  );
  return {
    content: textBlock?.text?.trim() ?? '',
    tokensUsed: data.usage
      ? (data.usage.input_tokens ?? 0) + (data.usage.output_tokens ?? 0)
      : null,
  };
}

async function callGoogle(
  apiKey: string,
  model: string,
  temperature: number,
  systemPrompt: string,
  userPrompt: string,
) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error?.message || `Google AI API error: ${response.status}`,
    );
  }

  const data = await response.json();
  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
  return {
    content: text,
    tokensUsed: data.usageMetadata
      ? (data.usageMetadata.promptTokenCount ?? 0) +
        (data.usageMetadata.candidatesTokenCount ?? 0)
      : null,
  };
}

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();

    // Validate required fields
    if (!body.provider || !body.apiKey || !body.model || !body.prompt || !body.platform || !body.accountName) {
      return NextResponse.json(
        { error: 'Missing required fields: provider, apiKey, model, prompt, platform, accountName' },
        { status: 400 },
      );
    }

    if (!['openai', 'anthropic', 'google'].includes(body.provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be one of: openai, anthropic, google' },
        { status: 400 },
      );
    }

    const temperature = Math.min(Math.max(body.temperature ?? 0.7, 0), 1);

    const systemPrompt = buildSystemPrompt(
      body.platform,
      body.accountName,
      body.styleProfile,
      body.formula,
    );

    let result: { content: string; tokensUsed: number | null };

    switch (body.provider) {
      case 'openai':
        result = await callOpenAI(
          body.apiKey, body.model, temperature, systemPrompt, body.prompt,
        );
        break;
      case 'anthropic':
        result = await callAnthropic(
          body.apiKey, body.model, temperature, systemPrompt, body.prompt,
        );
        break;
      case 'google':
        result = await callGoogle(
          body.apiKey, body.model, temperature, systemPrompt, body.prompt,
        );
        break;
    }

    return NextResponse.json({
      content: result.content,
      provider: body.provider,
      model: body.model,
      tokensUsed: result.tokensUsed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('[AI Generate Error]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
