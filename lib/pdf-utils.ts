// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse/dist/pdf-parse/cjs/index.cjs') as (buf: Buffer) => Promise<{ text: string }>

export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  const buffer = Buffer.from(arrayBuffer)
  const { text } = await pdfParse(buffer)
  return text
}
