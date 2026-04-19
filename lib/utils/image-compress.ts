const MAX_EDGE_PX = 2048
const JPEG_QUALITY = 0.85
const MAX_OUTPUT_BYTES = 6 * 1024 * 1024

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file

  let objectUrl: string | null = null
  try {
    const img = await loadImage(file)
    objectUrl = img.src

    const { width, height } = scaleToMaxEdge(img.naturalWidth, img.naturalHeight, MAX_EDGE_PX)

    // Source already small enough and under target size → keep original
    if (
      width === img.naturalWidth &&
      height === img.naturalHeight &&
      file.size <= MAX_OUTPUT_BYTES
    ) {
      return file
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(img, 0, 0, width, height)

    const blob = await canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY)
    if (!blob) return file

    return new File([blob], stripExtension(file.name) + '.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })
  } catch {
    return file
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image load failed'))
    }
    img.src = url
  })
}

function scaleToMaxEdge(w: number, h: number, max: number): { width: number; height: number } {
  if (w <= max && h <= max) return { width: w, height: h }
  const ratio = w > h ? max / w : max / h
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

function stripExtension(name: string): string {
  const i = name.lastIndexOf('.')
  return i <= 0 ? name : name.slice(0, i)
}
