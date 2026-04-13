'use client'

import { useState, type HTMLAttributes } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AccordionItem {
  id:      string
  trigger: React.ReactNode
  content: React.ReactNode
}

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  items:    AccordionItem[]
  multiple?: boolean
  defaultOpen?: string[]
}

// ─── Component ────────────────────────────────────────────────────────────────

function Accordion({ items, multiple = false, defaultOpen = [], className = '', ...props }: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpen)

  function toggle(id: string) {
    setOpenIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id)
      return multiple ? [...prev, id] : [id]
    })
  }

  return (
    <div
      className={['divide-y divide-border rounded-2xl border border-border overflow-hidden', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {items.map((item) => {
        const isOpen = openIds.includes(item.id)
        return (
          <div key={item.id} className="bg-surface">
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-text-primary hover:bg-surface-subtle transition-colors"
            >
              {item.trigger}
              <svg
                className={['h-4 w-4 shrink-0 text-text-muted transition-transform', isOpen ? 'rotate-180' : ''].join(' ')}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-5 pb-4 text-sm text-text-secondary border-t border-border-subtle">
                <div className="pt-3">{item.content}</div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export { Accordion }
