import type { ColorTheme, FaviconSettingsConfig, BadgeOptions } from './types'

export class FaviconController {
  private config: FaviconSettingsConfig
  private activeTheme: ColorTheme = 'auto'
  private mediaListenerCleanups: Array<() => void> = []
  private currentHref: string | null = null

  constructor(config: FaviconSettingsConfig = {}) {
    this.config = { ...config }
  }

  public setConfig(config: FaviconSettingsConfig): void {
    this.config = { ...this.config, ...config }
    this.update()
  }

  public setTheme(theme: ColorTheme): void {
    this.activeTheme = theme
    this.update()
  }

  public resolveEffectiveTheme(): 'light' | 'dark' {
    if (this.activeTheme === 'light' || this.activeTheme === 'dark') {
      return this.activeTheme
    }

    if (typeof window !== 'undefined' && window.matchMedia) {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return isDark ? 'dark' : 'light'
    }

    return 'light'
  }

  public resolveFaviconUrl(theme?: 'light' | 'dark'): string {
    const effectiveTheme = theme ?? this.resolveEffectiveTheme()
    const {
      faviconUrl,
      faviconUrlLight,
      faviconUrlDark,
      logoUrlLight,
      logoUrlDark,
      defaultFaviconUrl = '/favicon.ico',
    } = this.config

    if (effectiveTheme === 'dark') {
      return faviconUrlDark || faviconUrl || logoUrlDark || defaultFaviconUrl
    }

    return faviconUrlLight || faviconUrl || logoUrlLight || defaultFaviconUrl
  }

  public update(): string {
    const url = this.resolveFaviconUrl()
    this.currentHref = url

    if (typeof document === 'undefined') {
      return url
    }

    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }

    link.href = url

    if (this.config.appleTouchIconUrl) {
      let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null
      if (!appleLink) {
        appleLink = document.createElement('link')
        appleLink.rel = 'apple-touch-icon'
        document.head.appendChild(appleLink)
      }
      appleLink.href = this.config.appleTouchIconUrl
    }

    if (this.config.title) {
      document.title = this.config.title
    }

    return url
  }

  public startSystemThemeSync(): () => void {
    this.stopSystemThemeSync()

    if (typeof window === 'undefined' || !window.matchMedia) {
      return () => {}
    }

    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (this.activeTheme === 'auto') {
        this.update()
      }
    }

    if (typeof darkQuery.addEventListener === 'function') {
      darkQuery.addEventListener('change', handler)
      const cleanup = () => darkQuery.removeEventListener('change', handler)
      this.mediaListenerCleanups.push(cleanup)
      return cleanup
    } else if (typeof (darkQuery as any).addListener === 'function') {
      ;(darkQuery as any).addListener(handler)
      const cleanup = () => (darkQuery as any).removeListener(handler)
      this.mediaListenerCleanups.push(cleanup)
      return cleanup
    }

    return () => {}
  }

  public stopSystemThemeSync(): void {
    this.mediaListenerCleanups.forEach((cleanup) => cleanup())
    this.mediaListenerCleanups = []
  }

  public getCurrentUrl(): string | null {
    return this.currentHref || this.resolveFaviconUrl()
  }
}
