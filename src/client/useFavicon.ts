import { useEffect, useMemo } from 'react'
import type { ColorTheme, FaviconSettingsConfig, BadgeOptions } from '../core/types'
import { FaviconController } from '../core/faviconController'
import { createBadgedFavicon } from '../core/faviconBadge'

export interface UseFaviconOptions extends FaviconSettingsConfig {
  theme?: ColorTheme
  badge?: BadgeOptions
}

export function useFavicon(options: UseFaviconOptions = {}) {
  const {
    theme = 'auto',
    badge,
    faviconUrl,
    faviconUrlLight,
    faviconUrlDark,
    faviconUrlHighContrast,
    logoUrlLight,
    logoUrlDark,
    defaultFaviconUrl,
    appleTouchIconUrl,
    manifestUrl,
    title,
  } = options

  const controller = useMemo(() => {
    return new FaviconController({
      faviconUrl,
      faviconUrlLight,
      faviconUrlDark,
      faviconUrlHighContrast,
      logoUrlLight,
      logoUrlDark,
      defaultFaviconUrl,
      appleTouchIconUrl,
      manifestUrl,
      title,
    })
  }, [])

  useEffect(() => {
    controller.setConfig({
      faviconUrl,
      faviconUrlLight,
      faviconUrlDark,
      faviconUrlHighContrast,
      logoUrlLight,
      logoUrlDark,
      defaultFaviconUrl,
      appleTouchIconUrl,
      manifestUrl,
      title,
    })
    controller.setTheme(theme)

    const rawUrl = controller.resolveFaviconUrl()

    if (badge && badge.count !== undefined && badge.count !== null && badge.count !== 0 && badge.count !== '') {
      createBadgedFavicon(rawUrl, badge).then((badgedUrl) => {
        if (typeof document !== 'undefined') {
          const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null
          if (link) {
            link.href = badgedUrl
          }
        }
      })
    }

    const cleanup = controller.startSystemThemeSync()
    return () => {
      cleanup()
      controller.stopSystemThemeSync()
    }
  }, [
    theme,
    badge?.count,
    badge?.color,
    badge?.backgroundColor,
    faviconUrl,
    faviconUrlLight,
    faviconUrlDark,
    faviconUrlHighContrast,
    logoUrlLight,
    logoUrlDark,
    defaultFaviconUrl,
    appleTouchIconUrl,
    manifestUrl,
    title,
  ])

  return {
    currentUrl: controller.getCurrentUrl(),
    effectiveTheme: controller.resolveEffectiveTheme(),
    controller,
  }
}
