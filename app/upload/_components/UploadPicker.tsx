'use client'

import { useRef, useState } from 'react'

interface Props {
  onFileSelected: (file: File) => void
  onManualText: (text: string) => void
}

export default function UploadPicker({ onFileSelected, onManualText }: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const [showManual, setShowManual] = useState(false)
  const [manualText, setManualText] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFileSelected(file)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ background: 'var(--nuskha-surface)' }}>
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--nuskha-teal)', fontFamily: 'var(--font-manrope)' }}>
            Upload Prescription
          </p>
          <h1 className="text-3xl font-bold leading-tight" style={{ color: 'var(--nuskha-on-surface)', fontFamily: 'var(--font-jakarta)' }}>
            How would you like to add it?
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.55, fontFamily: 'var(--font-manrope)' }}>
            We&apos;ll extract the details automatically using AI.
          </p>
        </div>

        {/* Option cards */}
        <div className="space-y-3">

          {/* Take / Upload Photo */}
          <button
            onClick={() => imageInputRef.current?.click()}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all active:scale-[0.98]"
            style={{ background: 'var(--nuskha-surface-lowest)', boxShadow: '0 2px 24px rgba(24,28,33,0.06)' }}
          >
            <span className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--nuskha-primary-container)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--nuskha-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: 'var(--nuskha-on-surface)', fontFamily: 'var(--font-jakarta)' }}>
                Take or Upload a Photo
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.5, fontFamily: 'var(--font-manrope)' }}>
                Camera, gallery, or screenshot — JPG, PNG, WEBP
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--nuskha-primary)', color: '#fff', fontFamily: 'var(--font-manrope)' }}>
              Best
            </span>
          </button>

          {/* Upload PDF */}
          <button
            onClick={() => pdfInputRef.current?.click()}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all active:scale-[0.98]"
            style={{ background: 'var(--nuskha-surface-lowest)', boxShadow: '0 2px 24px rgba(24,28,33,0.06)' }}
          >
            <span className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--nuskha-teal-container)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--nuskha-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="9" y1="13" x2="15" y2="13"/>
                <line x1="9" y1="17" x2="15" y2="17"/>
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: 'var(--nuskha-on-surface)', fontFamily: 'var(--font-jakarta)' }}>
                Upload PDF
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.5, fontFamily: 'var(--font-manrope)' }}>
                For digital hospital prescriptions
              </p>
            </div>
          </button>

          {/* Type Manually */}
          <button
            onClick={() => setShowManual((v) => !v)}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all active:scale-[0.98]"
            style={{ background: showManual ? 'var(--nuskha-surface-low)' : 'var(--nuskha-surface-lowest)', boxShadow: '0 2px 24px rgba(24,28,33,0.06)' }}
          >
            <span className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(24,28,33,0.06)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--nuskha-on-surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="17" y1="10" x2="3" y2="10"/>
                <line x1="21" y1="6" x2="3" y2="6"/>
                <line x1="21" y1="14" x2="3" y2="14"/>
                <line x1="17" y1="18" x2="3" y2="18"/>
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: 'var(--nuskha-on-surface)', fontFamily: 'var(--font-jakarta)' }}>
                Type Manually
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.5, fontFamily: 'var(--font-manrope)' }}>
                Fallback if the photo isn&apos;t readable
              </p>
            </div>
          </button>

          {/* Manual textarea (expands in place) */}
          {showManual && (
            <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--nuskha-surface-lowest)', boxShadow: '0 2px 24px rgba(24,28,33,0.06)' }}>
              <textarea
                rows={5}
                placeholder="Paste or type the prescription text here…"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  background: 'var(--nuskha-surface-low)',
                  color: 'var(--nuskha-on-surface)',
                  fontFamily: 'var(--font-manrope)',
                  border: 'none',
                }}
                onFocus={(e) => { e.target.style.background = 'var(--nuskha-surface-lowest)'; e.target.style.boxShadow = '0 0 0 1.5px rgba(24,28,33,0.20)' }}
                onBlur={(e) => { e.target.style.background = 'var(--nuskha-surface-low)'; e.target.style.boxShadow = 'none' }}
              />
              <button
                disabled={!manualText.trim()}
                onClick={() => onManualText(manualText.trim())}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-40"
                style={{ background: 'var(--nuskha-primary)', color: '#fff', fontFamily: 'var(--font-jakarta)' }}
              >
                Extract Prescription
              </button>
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="mt-6 px-4 py-3 rounded-xl flex gap-3" style={{ background: '#fff8e1' }}>
          <span className="text-base mt-0.5">💡</span>
          <p className="text-xs leading-relaxed" style={{ color: '#7a6200', fontFamily: 'var(--font-manrope)' }}>
            If your prescription arrived on WhatsApp, screenshot it and upload the image. For best results, ensure it&apos;s flat and well-lit.
          </p>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}
