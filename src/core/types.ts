export type ColorTheme = 'light' | 'dark' | 'auto'

export type FaviconFormat = 'ico' | 'png' | 'svg' | 'webp' | 'jpeg'

export interface FaviconItem {
  src: string
  format?: FaviconFormat
  sizes?: string // e.g. "16x16", "32x32", "any"
  type?: string // e.g. "image/png"
}

export interface FaviconSettingsConfig {
  /**
   * Primary / default favicon URL for all themes unless overridden
   */
  faviconUrl?: string

  /**
   * Dedicated favicon for light mode
   */
  faviconUrlLight?: string

  /**
   * Dedicated favicon for dark mode
   */
  faviconUrlDark?: string

  /**
   * Optional high-contrast mode favicon
   */
  faviconUrlHighContrast?: string

  /**
   * Optional fallback logo URL when favicon is unspecified
   */
  logoUrlLight?: string
  logoUrlDark?: string

  /**
   * Hard fallback if no favicons or logos match
   */
  defaultFaviconUrl?: string

  /**
   * Optional Apple Touch icon URL
   */
  appleTouchIconUrl?: string

  /**
   * Web App manifest URL
   */
  manifestUrl?: string

  /**
   * Document title to accompany favicon update
   */
  title?: string
}

export interface BadgeOptions {
  count?: number | string
  color?: string
  backgroundColor?: string
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  radius?: number
  size?: number
}

export interface FaviconUpdateOptions {
  theme?: ColorTheme
  badge?: BadgeOptions
}

export interface FileValidationResult {
  valid: boolean
  mime?: string
  format?: FaviconFormat
  error?: string
  sanitized?: boolean
}
