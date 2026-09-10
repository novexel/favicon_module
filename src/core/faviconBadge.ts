import type { BadgeOptions } from './types'

/**
 * Draws a badge (e.g. notification counter or alert indicator)
 * onto a favicon image and returns a base64 Data URI.
 */
export async function createBadgedFavicon(
  sourceUrl: string,
  options: BadgeOptions = {},
): Promise<string> {
  if (typeof document === 'undefined') {
    return sourceUrl
  }

  const {
    count,
    color = '#ffffff',
    backgroundColor = '#ef4444',
    size = 32,
    radius = 7,
  } = options

  if (count === undefined || count === null || count === 0 || count === '') {
    return sourceUrl
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      resolve(sourceUrl)
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // 1. Draw base icon
      ctx.drawImage(img, 0, 0, size, size)

      // 2. Compute badge geometry (top-right corner by default)
      const badgeX = size - radius - 1
      const badgeY = radius + 1

      // 3. Draw circle badge
      ctx.beginPath()
      ctx.arc(badgeX, badgeY, radius, 0, 2 * Math.PI, false)
      ctx.fillStyle = backgroundColor
      ctx.fill()

      // 4. Draw border around badge for contrast
      ctx.lineWidth = 1.5
      ctx.strokeStyle = '#ffffff'
      ctx.stroke()

      // 5. Draw text
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const label = typeof count === 'number' && count > 99 ? '99+' : String(count)
      ctx.font = `bold ${radius * 1.3}px sans-serif`
      ctx.fillText(label, badgeX, badgeY + 0.5)

      resolve(canvas.toDataURL('image/png'))
    }

    img.onerror = () => {
      resolve(sourceUrl)
    }

    img.src = sourceUrl
  })
}
