// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PDFParse } = require('pdf-parse') as { PDFParse: new (opts: { data: Buffer }) => { getText: () => Promise<{ text: string }>; destroy: () => Promise<void> } }

export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  const buffer = Buffer.from(arrayBuffer)
  const parser = new PDFParse({ data: buffer })
  const { text } = await parser.getText()
  await parser.destroy()
  return text
}
