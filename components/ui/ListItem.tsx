import React from 'react'

interface ListItemProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  badge?: React.ReactNode
  className?: string
}

export function ListItem({ icon, title, subtitle, badge, className = '' }: ListItemProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-9 h-9 rounded-[10px] bg-surface-subtle flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-semibold text-text-primary truncate">{title}</p>
        {subtitle && (
          <p className="font-body text-xs text-text-muted truncate mt-0.5">{subtitle}</p>
        )}
      </div>
      {badge && <div className="shrink-0">{badge}</div>}
    </div>
  )
}
