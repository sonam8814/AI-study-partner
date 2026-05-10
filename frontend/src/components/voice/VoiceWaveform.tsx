'use client'

interface VoiceWaveformProps {
  active: boolean
}

export default function VoiceWaveform({ active }: VoiceWaveformProps) {
  return (
    <div className={`flex items-end h-6 w-12 gap-0.5 ${active ? '' : 'opacity-30'}`}>
      {[2, 4, 6, 3, 5].map((h, i) => (
        <div
          key={i}
          className="waveform-bar"
          style={{
            height: active ? `${h * 4}px` : '8px',
            transition: `height ${0.1 + i * 0.05}s ease-in-out`,
            animation: active ? `waveBar${i} 0.8s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes waveBar0 { from { height: 8px; } to { height: 20px; } }
        @keyframes waveBar1 { from { height: 12px; } to { height: 24px; } }
        @keyframes waveBar2 { from { height: 16px; } to { height: 8px; } }
        @keyframes waveBar3 { from { height: 10px; } to { height: 18px; } }
        @keyframes waveBar4 { from { height: 14px; } to { height: 22px; } }
      `}</style>
    </div>
  )
}
