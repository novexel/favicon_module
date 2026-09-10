import { z } from 'zod'
import type { FaviconSettingsConfig } from './types'

const safeUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val) return true
      // Reject dangerous protocols
      const lower = val.toLowerCase()
      if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || lower.startsWith('data:text/html')) {
        return false
      }
      // Allow relative paths, data images, and standard http/https URLs
      return (
        val.startsWith('/') ||
        val.startsWith('./') ||
        val.startsWith('../') ||
        lower.startsWith('http://') ||
        lower.startsWith('https://') ||
        lower.startsWith('data:image/')
      )
    },
    { message: 'Invalid or unsafe favicon URL scheme.' },
  )
  .optional()

export const faviconSettingsSchema = z.object({
  faviconUrl: safeUrlSchema,
  faviconUrlLight: safeUrlSchema,
  faviconUrlDark: safeUrlSchema,
  faviconUrlHighContrast: safeUrlSchema,
  logoUrlLight: safeUrlSchema,
  logoUrlDark: safeUrlSchema,
  defaultFaviconUrl: safeUrlSchema,
  appleTouchIconUrl: safeUrlSchema,
  manifestUrl: safeUrlSchema,
  title: z.string().trim().max(120).optional(),
})

export const validateFaviconConfig = (config: unknown): FaviconSettingsConfig => {
  return faviconSettingsSchema.parse(config) as FaviconSettingsConfig
}

export const safeValidateFaviconConfig = (config: unknown) => {
  return faviconSettingsSchema.safeParse(config)
}
