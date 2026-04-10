/**
 * Google Vision AI — extracts raw text from a base64-encoded image or PDF.
 * Returns the full concatenated text detected in the image.
 */
export async function extractTextFromImage(base64Content: string, mimeType: string): Promise<string> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY
  if (!apiKey) throw new Error('GOOGLE_VISION_API_KEY is not set')

  const body = {
    requests: [
      {
        image: { content: base64Content },
        features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
        imageContext: mimeType === 'application/pdf'
          ? { languageHints: ['en'] }
          : undefined,
      },
    ],
  }

  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Vision API error: ${err}`)
  }

  const data = await res.json()
  const annotation = data.responses?.[0]?.fullTextAnnotation
  return annotation?.text ?? ''
}
