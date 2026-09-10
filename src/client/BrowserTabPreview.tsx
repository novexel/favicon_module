import React from 'react'

export interface BrowserTabPreviewProps {
  faviconUrl?: string
  title?: string
  theme?: 'light' | 'dark'
  className?: string
}

export const BrowserTabPreview: React.FC<BrowserTabPreviewProps> = ({
  faviconUrl,
  title = 'My Enterprise Portal',
  theme = 'light',
  className = '',
}) => {
  const isDark = theme === 'dark'

  return (
    <div
      className={`rounded-2xl border overflow-hidden shadow-sm transition-all duration-200 ${
        isDark ? 'bg-[#18181b] border-zinc-800 text-zinc-100' : 'bg-[#f4f4f5] border-zinc-200 text-zinc-800'
      } ${className}`}
    >
      {/* Mock Browser Header / Chrome Bar */}
      <div
        className={`px-4 py-2.5 flex items-center gap-3 border-b ${
          isDark ? 'bg-[#27272a] border-zinc-800' : 'bg-[#e4e4e7] border-zinc-300'
        }`}
      >
        {/* Window controls */}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 opacity-80" />
        </div>

        {/* Tab Item */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs max-w-[220px] font-medium truncate shadow-sm transition-all ${
            isDark ? 'bg-[#18181b] text-zinc-200' : 'bg-white text-zinc-900'
          }`}
        >
          <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {faviconUrl ? (
              <img
                src={faviconUrl}
                alt="Tab Icon"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-dashed border-zinc-400" />
            )}
          </div>
          <span className="truncate">{title}</span>
          <span className="ml-auto text-[10px] opacity-40 font-bold hover:opacity-100 cursor-pointer">×</span>
        </div>
      </div>

      {/* Mock Tab Body View */}
      <div className={`p-4 text-center text-xs opacity-60 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
        Simulated {isDark ? 'Dark Mode' : 'Light Mode'} Browser Tab
      </div>
    </div>
  )
}
