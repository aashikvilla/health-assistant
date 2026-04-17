'use client'

import React from 'react'
import { APP_NAME } from '@/constants'

interface StatPill {
  num: number | string
  label: string
}

interface GradientHeroHeaderProps {
  title: string
  subtitle?: string
  stats?: StatPill[]
  navAction?: React.ReactNode
  greeting?: string  // e.g. "Good day,"
}

export function GradientHeroHeader({ title, subtitle, stats, navAction, greeting }: GradientHeroHeaderProps) {
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 gradient-hero">
      <div className="relative overflow-hidden">
        {/* Decorative radial overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 80% 15%, rgba(168,85,247,.45) 0%, transparent 55%), radial-gradient(circle at 5% 85%, rgba(29,78,216,.35) 0%, transparent 50%)',
          }}
        />
        {/* Top nav bar */}
        <div className="relative flex items-center justify-between px-5 pt-safe h-14">
          <span
            className="font-display text-xl font-extrabold tracking-tight"
            style={{
              background: 'linear-gradient(90deg,#fff 0%,rgba(255,255,255,.75) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {APP_NAME}
          </span>
          {navAction && <div>{navAction}</div>}
        </div>

        {/* Greeting + title */}
        <div className="relative px-5 pt-6 pb-0">
          {greeting && (
            <p className="font-body text-[13px] font-medium mb-1" style={{ color: 'rgba(255,255,255,.65)' }}>
              {greeting}
            </p>
          )}
          <h1 className="font-display text-[28px] font-extrabold text-white tracking-tight leading-none">
            {title}
          </h1>
          {subtitle && (
            <p className="font-body text-sm mt-1" style={{ color: 'rgba(255,255,255,.65)' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Stat pills */}
        {stats && stats.length > 0 && (
          <div className="relative flex gap-3 px-5 pt-5 pb-10">
            {stats.map(({ num, label }) => (
              <div
                key={label}
                className="flex-1 rounded-xl px-3 py-3"
                style={{
                  background: 'rgba(255,255,255,.13)',
                  border: '1px solid rgba(255,255,255,.2)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="font-display text-[26px] font-extrabold text-white leading-none mb-0.5">{num}</div>
                <div className="font-body text-[11px] font-medium leading-tight" style={{ color: 'rgba(255,255,255,.65)' }}>{label}</div>
              </div>
            ))}
          </div>
        )}
        {/* Bottom spacing when no stats */}
        {(!stats || stats.length === 0) && <div className="pb-8" />}
      </div>
    </div>
  )
}
