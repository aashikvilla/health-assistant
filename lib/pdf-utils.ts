import { extractText, getDocumentProxy } from 'unpdf'

export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer))
  const { text } = await extractText(pdf, { mergePages: true })
  return text
}
