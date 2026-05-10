'use client'

interface AlwaysListeningBannerProps {
  onDisable: () => void
}

export default function AlwaysListeningBanner({ onDisable }: AlwaysListeningBannerProps) {
  return (
    <div className="hidden sm:flex items-center gap-2 bg-primary px-3 py-1.5 rounded-full text-surface-container-lowest animate-pulse cursor-pointer" onClick={onDisable}>
      <span className="material-symbols-outlined text-[18px]">mic</span>
      <span className="font-label-sm text-[11px] uppercase tracking-widest">Always Listening</span>
    </div>
  )
}
