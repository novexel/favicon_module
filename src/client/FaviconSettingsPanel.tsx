import React, { useState } from 'react'
import type { FaviconSettingsConfig } from '../core/types'
import { BrowserTabPreview } from './BrowserTabPreview'

export interface FaviconSettingsPanelProps {
  settings: FaviconSettingsConfig
  onChange: (updated: FaviconSettingsConfig) => void
  onUpload?: (file: File, targetField: 'faviconUrl' | 'faviconUrlLight' | 'faviconUrlDark') => Promise<string>
  portalTitle?: string
  className?: string
}

export const FaviconSettingsPanel: React.FC<FaviconSettingsPanelProps> = ({
  settings,
  onChange,
  onUpload,
  portalTitle = 'Enterprise Portal',
  className = '',
}) => {
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTextChange = (field: keyof FaviconSettingsConfig, val: string) => {
    onChange({
      ...settings,
      [field]: val,
    })
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'faviconUrl' | 'faviconUrlLight' | 'faviconUrlDark',
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!onUpload) {
      // Fallback: create local object URL
      const localUrl = URL.createObjectURL(file)
      handleTextChange(field, localUrl)
      return
    }

    try {
      setUploadingField(field)
      setError(null)
      const uploadedUrl = await onUpload(file, field)
      handleTextChange(field, uploadedUrl)
    } catch (err: any) {
      setError(err?.message || 'Failed to upload favicon image.')
    } finally {
      setUploadingField(null)
    }
  }

  return (
    <div className={`space-y-8 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 ${className}`}>
      <div>
        <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Favicon & Identity Configuration
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Upload and fine-tune browser tab icons. The browser automatically toggles between Light and Dark mode favicons based on OS and application preferences.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 font-medium">
          {error}
        </div>
      )}

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Global Favicon */}
        <div className="space-y-3">
          <label className="block text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
            Global Favicon
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={settings.faviconUrl || ''}
              onChange={(e) => handleTextChange('faviconUrl', e.target.value)}
              placeholder="https://.../favicon.ico"
              className="flex-1 px-4 py-2.5 text-xs font-mono rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-teal-500/50"
            />
            <label className="cursor-pointer px-3.5 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-xs font-bold transition flex items-center justify-center">
              <input
                type="file"
                className="hidden"
                accept="image/*,.ico"
                onChange={(e) => handleFileUpload(e, 'faviconUrl')}
              />
              {uploadingField === 'faviconUrl' ? '...' : '↑'}
            </label>
          </div>
          <p className="text-[10px] text-zinc-400">Universal fallback icon for all themes</p>
        </div>

        {/* 2. Light Mode Favicon */}
        <div className="space-y-3">
          <label className="block text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
            Light Theme Favicon
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={settings.faviconUrlLight || ''}
              onChange={(e) => handleTextChange('faviconUrlLight', e.target.value)}
              placeholder="Light theme icon"
              className="flex-1 px-4 py-2.5 text-xs font-mono rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-teal-500/50"
            />
            <label className="cursor-pointer px-3.5 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-xs font-bold transition flex items-center justify-center">
              <input
                type="file"
                className="hidden"
                accept="image/*,.ico"
                onChange={(e) => handleFileUpload(e, 'faviconUrlLight')}
              />
              {uploadingField === 'faviconUrlLight' ? '...' : '↑'}
            </label>
          </div>
          <p className="text-[10px] text-zinc-400">Displays when browser is in Light Mode</p>
        </div>

        {/* 3. Dark Mode Favicon */}
        <div className="space-y-3">
          <label className="block text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
            Dark Theme Favicon
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={settings.faviconUrlDark || ''}
              onChange={(e) => handleTextChange('faviconUrlDark', e.target.value)}
              placeholder="Dark theme icon"
              className="flex-1 px-4 py-2.5 text-xs font-mono rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-teal-500/50"
            />
            <label className="cursor-pointer px-3.5 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-xs font-bold transition flex items-center justify-center">
              <input
                type="file"
                className="hidden"
                accept="image/*,.ico"
                onChange={(e) => handleFileUpload(e, 'faviconUrlDark')}
              />
              {uploadingField === 'faviconUrlDark' ? '...' : '↑'}
            </label>
          </div>
          <p className="text-[10px] text-zinc-400">High-visibility icon for dark browser Chrome</p>
        </div>
      </div>

      {/* Real-time Browser Tab Mockup Previews */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
        <h4 className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
          Live Browser Tab Simulation
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BrowserTabPreview
            theme="light"
            title={portalTitle}
            faviconUrl={settings.faviconUrlLight || settings.faviconUrl}
          />
          <BrowserTabPreview
            theme="dark"
            title={portalTitle}
            faviconUrl={settings.faviconUrlDark || settings.faviconUrl}
          />
        </div>
      </div>
    </div>
  )
}
