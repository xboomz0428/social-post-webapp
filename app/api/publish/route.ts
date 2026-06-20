import { NextResponse } from 'next/server'

interface PublishRequest {
  platform: string
  content: string
  imageUrl?: string
  apiKeys: Record<string, string>
}

async function publishToThreads(content: string, keys: Record<string, string>) {
  const { accessToken, userId } = keys
  if (!accessToken || !userId) throw new Error('Threads API Key 未設定')

  const createRes = await fetch(
    `https://graph.threads.net/v1.0/${userId}/threads`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: content,
        media_type: 'TEXT',
        access_token: accessToken,
      }),
    }
  )
  const createData = await createRes.json()
  if (createData.error) throw new Error(`Threads 建立失敗：${createData.error.message}`)

  const publishRes = await fetch(
    `https://graph.threads.net/v1.0/${userId}/threads_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: createData.id,
        access_token: accessToken,
      }),
    }
  )
  const publishData = await publishRes.json()
  if (publishData.error) throw new Error(`Threads 發佈失敗：${publishData.error.message}`)

  return { postId: publishData.id, url: `https://www.threads.net/@me/post/${publishData.id}` }
}

async function publishToX(content: string, keys: Record<string, string>) {
  const { apiKey, apiSecret, accessToken, accessSecret } = keys
  if (!apiKey || !apiSecret || !accessToken || !accessSecret) throw new Error('X API Key 未設定')

  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = crypto.randomUUID().replace(/-/g, '')

  const params: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: '1.0',
  }

  const method = 'POST'
  const url = 'https://api.twitter.com/2/tweets'

  const paramString = Object.keys(params).sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&')
  const signatureBase = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`
  const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessSecret)}`

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(signingKey), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signatureBase))
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))

  const authHeader = `OAuth ${Object.entries({ ...params, oauth_signature: signatureB64 })
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(', ')}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: content }),
  })
  const data = await res.json()
  if (data.errors) throw new Error(`X 發佈失敗：${JSON.stringify(data.errors)}`)
  if (!res.ok) throw new Error(`X 發佈失敗：${data.detail || data.title || res.status}`)

  return { postId: data.data?.id, url: `https://x.com/i/status/${data.data?.id}` }
}

async function publishToFacebook(content: string, keys: Record<string, string>) {
  const { accessToken, pageId } = keys
  if (!accessToken || !pageId) throw new Error('Facebook API Key 未設定')

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${pageId}/feed`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: content,
        access_token: accessToken,
      }),
    }
  )
  const data = await res.json()
  if (data.error) throw new Error(`Facebook 發佈失敗：${data.error.message}`)

  return { postId: data.id, url: `https://www.facebook.com/${data.id}` }
}

async function publishToInstagram(content: string, keys: Record<string, string>, imageUrl?: string) {
  const { accessToken, igUserId } = keys
  if (!accessToken || !igUserId) throw new Error('Instagram API Key 未設定')

  if (!imageUrl) throw new Error('Instagram 發文必須要有圖片。請在貼文中插入圖片。')

  const createRes = await fetch(
    `https://graph.facebook.com/v21.0/${igUserId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caption: content,
        image_url: imageUrl,
        access_token: accessToken,
      }),
    }
  )
  const createData = await createRes.json()
  if (createData.error) throw new Error(`Instagram 建立失敗：${createData.error.message}`)

  const publishRes = await fetch(
    `https://graph.facebook.com/v21.0/${igUserId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: createData.id,
        access_token: accessToken,
      }),
    }
  )
  const publishData = await publishRes.json()
  if (publishData.error) throw new Error(`Instagram 發佈失敗：${publishData.error.message}`)

  return { postId: publishData.id }
}

export async function POST(request: Request) {
  try {
    const { platform, content, imageUrl, apiKeys }: PublishRequest = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: '貼文內容不能為空' }, { status: 400 })
    }

    let result
    switch (platform) {
      case 'threads':
        result = await publishToThreads(content, apiKeys)
        break
      case 'x':
        result = await publishToX(content, apiKeys)
        break
      case 'facebook':
        result = await publishToFacebook(content, apiKeys)
        break
      case 'instagram':
        result = await publishToInstagram(content, apiKeys, imageUrl)
        break
      default:
        return NextResponse.json({ error: `不支援的平台：${platform}` }, { status: 400 })
    }

    return NextResponse.json({ success: true, platform, ...result })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '發佈失敗' },
      { status: 500 }
    )
  }
}
