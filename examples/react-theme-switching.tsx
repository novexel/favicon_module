import React, { useState } from 'react'
import {
  useFavicon,
  FaviconSettingsPanel,
  BrowserTabPreview,
  type FaviconSettingsConfig,
} from '@novexel/favicon'

export function App() {
  const [settings, setSettings] = useState<FaviconSettingsConfig>({
    faviconUrl: '/favicon.ico',
    faviconUrlLight: '/favicon-light.png',
    faviconUrlDark: '/favicon-dark.png',
    title: 'Novexel Enterprise Portal',
  })

  const [theme, setTheme] = useState<'auto' | 'light' | 'dark'>('auto')
  const [unreadCount, setUnreadCount] = useState<number>(3)

  // Reactively updates <link rel="icon"> in DOM
  const { currentUrl, effectiveTheme } = useFavicon({
    ...settings,
    theme,
    badge: { count: unreadCount },
  })

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>Favicon Management Studio</h1>
      <p>Active Theme: {effectiveTheme} | Current Favicon: {currentUrl}</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button onClick={() => setTheme('light')}>Light</button>
        <button onClick={() => setTheme('dark')}>Dark</button>
        <button onClick={() => setTheme('auto')}>System Auto</button>
        <button onClick={() => setUnreadCount((c) => c + 1)}>Increment Badge (+1)</button>
      </div>

      <FaviconSettingsPanel
        settings={settings}
        onChange={setSettings}
        portalTitle={settings.title}
      />
    </div>
  )
}
