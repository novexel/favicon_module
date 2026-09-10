import type { FileValidationResult, FaviconFormat } from '../core/types'

/**
 * Validates binary magic numbers to guarantee an uploaded file
 * is genuinely a valid, safe favicon format (ICO, PNG, SVG, WebP, JPEG).
 */
export function validateFaviconBuffer(
  buffer: Buffer,
  declaredFilename?: string,
): FileValidationResult {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'Empty file buffer received.' }
  }

  // Check 1: ICO magic number (0x00 0x00 0x01 0x00)
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x00 &&
    buffer[1] === 0x00 &&
    buffer[2] === 0x01 &&
    buffer[3] === 0x00
  ) {
    return { valid: true, mime: 'image/x-icon', format: 'ico' }
  }

  // Check 2: PNG magic number (0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A)
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { valid: true, mime: 'image/png', format: 'png' }
  }

  // Check 3: WebP magic number (RIFF....WEBP)
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { valid: true, mime: 'image/webp', format: 'webp' }
  }

  // Check 4: JPEG magic number (0xFF 0xD8 0xFF)
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, mime: 'image/jpeg', format: 'jpeg' }
  }

  // Check 5: SVG (XML text format with strict sanitization against XSS)
  const textSample = buffer.toString('utf8', 0, Math.min(buffer.length, 4096)).trim()
  if (textSample.includes('<svg') || textSample.includes('<?xml')) {
    // Perform SVG Security Check
    const fullText = buffer.toString('utf8').toLowerCase()

    // Flag dangerous tags / attributes
    const dangerousPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/i,
      /<script[\s\S]*?>/i,
      /javascript:/i,
      /onload\s*=/i,
      /onerror\s*=/i,
      /onclick\s*=/i,
      /onmouseover\s*=/i,
      /<foreignobject[\s\S]*?>/i,
      /<iframe[\s\S]*?>/i,
      /<object[\s\S]*?>/i,
      /<embed[\s\S]*?>/i,
    ]

    for (const pattern of dangerousPatterns) {
      if (pattern.test(fullText)) {
        return {
          valid: false,
          error: 'Security verification failed: Malicious or active script content detected in SVG favicon.',
        }
      }
    }

    return { valid: true, mime: 'image/svg+xml', format: 'svg', sanitized: true }
  }

  return {
    valid: false,
    error: 'Unsupported or spoofed image format. Allowed: .ico, .png, .svg, .webp, .jpeg.',
  }
}
