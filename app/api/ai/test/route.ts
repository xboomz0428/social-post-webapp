import { NextResponse } from 'next/server';

interface TestRequest {
  provider: 'openai' | 'anthropic' | 'google';
  apiKey: string;
  model: string;
}

const TEST_PROMPT = "Hello, respond with 'API connection successful' in Chinese. Keep your response to just that phrase.";

async function testOpenAI(apiKey: string, model: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 50,
      messages: [{ role: 'user', content: TEST_PROMPT }],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error?.message || `OpenAI API error: ${response.status}`,
    );
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

async function testAnthropic(apiKey: string, model: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 50,
      messages: [{ role: 'user', content: TEST_PROMPT }],
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
  return textBlock?.text?.trim() ?? '';
}

async function testGoogle(apiKey: string, model: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: TEST_PROMPT }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 50,
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
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
}

export async function POST(request: Request) {
  try {
    const body: TestRequest = await request.json();

    if (!body.provider || !body.apiKey || !body.model) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: provider, apiKey, model', model: '' },
        { status: 400 },
      );
    }

    if (!['openai', 'anthropic', 'google'].includes(body.provider)) {
      return NextResponse.json(
        { success: false, message: 'Invalid provider. Must be one of: openai, anthropic, google', model: '' },
        { status: 400 },
      );
    }

    let message: string;

    switch (body.provider) {
      case 'openai':
        message = await testOpenAI(body.apiKey, body.model);
        break;
      case 'anthropic':
        message = await testAnthropic(body.apiKey, body.model);
        break;
      case 'google':
        message = await testGoogle(body.apiKey, body.model);
        break;
    }

    return NextResponse.json({
      success: true,
      message,
      model: body.model,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('[AI Test Error]', errorMessage);
    return NextResponse.json(
      { success: false, message: errorMessage, model: '' },
      { status: 500 },
    );
  }
}
