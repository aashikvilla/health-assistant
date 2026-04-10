/**
 * Icon Generator — run once to produce PWA icons from the SVG source.
 *
 * Usage:
 *   npm install --save-dev sharp   (one-time)
 *   node scripts/generate-icons.mjs
 *
 * Output: public/icons/icon-{size}.png for all required sizes.
 * Check the generated files into git.
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

async function generate() {
  let sharp
  try {
    sharp = (await import('sharp')).default
  } catch {
    console.error('❌  sharp is not installed. Run: npm install --save-dev sharp')
    process.exit(1)
  }

  const svgBuffer = readFileSync(resolve(root, 'public/icons/icon.svg'))

  for (const size of sizes) {
    const outPath = resolve(root, `public/icons/icon-${size}.png`)
    await sharp(svgBuffer).resize(size, size).png().toFile(outPath)
    console.log(`✓  ${size}x${size} → public/icons/icon-${size}.png`)
  }

  console.log('\n✅  All icons generated. Commit public/icons/*.png to git.')
}

generate()
