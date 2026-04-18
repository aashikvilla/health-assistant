const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'
const GEMINI_MODEL = 'gemma-4-26b'

export type GeminiImage = { base64: string; mimeType: string }

export type GeminiCallOptions = {
  apiKey: string
  prompt: string
  image?: GeminiImage
  maxTokens?: number
  jsonMode?: boolean
  temperature?: number
}

export class GeminiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'GeminiError'
  }
}

type Part = { text: string } | { inline_data: { mime_type: string; data: string } }

export async function callGemini(opts: GeminiCallOptions): Promise<string> {
  const { apiKey, prompt, image, maxTokens = 4096, jsonMode = true, temperature = 0 } = opts

  if (!apiKey) throw new GeminiError('Gemini API key missing', 500)

  const parts: Part[] = []
  if (image) {
    parts.push({ inline_data: { mime_type: image.mimeType, data: image.base64 } })
  }
  parts.push({ text: prompt })

  const body = {
    contents: [{ parts }],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature,
      ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
    },
  }

  const url = `${GEMINI_ENDPOINT}/${GEMINI_MODEL}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new GeminiError(`Gemini ${res.status}: ${err}`, res.status)
  }

  const data = await res.json()
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  if (!text) throw new GeminiError('Empty response from Gemini', 502)
  return text
}

export function stripJsonFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}
