interface DisclaimerBannerProps {
  doctorName: string
  className?: string
}

function DisclaimerBanner({ doctorName, className = '' }: DisclaimerBannerProps) {
  return (
    <div
      className={[
        'bg-warning-subtle rounded-2xl p-4 flex items-start gap-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="alert"
    >
      <svg
        className="w-5 h-5 text-warning shrink-0 mt-0.5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.499-2.599 4.499H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.004zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clipRule="evenodd"
        />
      </svg>
      <p className="font-body text-sm text-text-secondary leading-relaxed">
        AI-generated summary. Do not adjust medication based on this.
        Consult {doctorName} before making any changes.
      </p>
    </div>
  )
}

export { DisclaimerBanner }
export type { DisclaimerBannerProps }
