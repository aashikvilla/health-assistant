const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'
const GEMINI_MODEL = 'gemma-4-26b-a4b-it'
// Gemma 4 doesn't support application/pdf inline_data — use a Gemini model for PDFs
const GEMINI_PDF_MODEL = 'gemini-2.0-flash'

export type GeminiImage = { base64: string; mimeType: string }

export type GeminiCallOptions = {
  apiKey: string
  prompt: string
  image?: GeminiImage
  maxTokens?: number
  jsonMode?: boolean
  temperature?: number
  model?: string
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

export { GEMINI_PDF_MODEL }

export async function callGemini(opts: GeminiCallOptions): Promise<string> {
  const { apiKey, prompt, image, maxTokens = 4096, jsonMode = true, temperature = 0, model = GEMINI_MODEL } = opts

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

  const url = `${GEMINI_ENDPOINT}/${model}:generateContent?key=${apiKey}`

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

  const candidate = data.candidates?.[0]
  if (!candidate) throw new GeminiError('No candidates in response', 502)
  if (candidate.finishReason === 'SAFETY') throw new GeminiError('Response blocked by safety filter', 502)

  // Gemma 4 prefixes thinking parts (thought: true) before the actual response
  const responseParts: Array<{ text?: string; thought?: boolean }> = candidate.content?.parts ?? []
  const text: string = responseParts.find(p => !p.thought)?.text ?? ''

  if (!text) throw new GeminiError('Empty response from Gemini', 502)
  return text
}

export function stripJsonFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}
