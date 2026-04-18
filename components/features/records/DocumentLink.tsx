interface DocumentLinkProps {
  url: string
  fileUrl: string | null
  documentType: string
}

export function DocumentLink({ url, fileUrl, documentType }: DocumentLinkProps) {
  const isPdf    = fileUrl?.toLowerCase().endsWith('.pdf')
  const ctaText  = documentType === 'prescription'
    ? 'View your original prescription →'
    : 'View your original lab report →'

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 bg-surface-subtle hover:bg-surface-container-lowest rounded-2xl px-4 py-3.5 transition-colors"
      style={{ boxShadow: '0 2px 12px rgba(24,28,33,0.04)' }}
    >
      <div className="w-9 h-9 rounded-xl bg-primary-subtle flex items-center justify-center shrink-0">
        {isPdf ? (
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{ctaText}</p>
        <p className="text-xs text-text-muted mt-0.5">{isPdf ? 'PDF' : 'Image'} · Opens in new tab</p>
      </div>
      <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}
