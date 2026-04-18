import { extractText, getDocumentProxy } from 'unpdf'

export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  // Clone the buffer: pdfjs-dist transfers the typed array to its worker,
  // which detaches the original ArrayBuffer and breaks any later reads (e.g. base64 fallback).
  const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer.slice(0)))
  const { text } = await extractText(pdf, { mergePages: true })
  return text
}
