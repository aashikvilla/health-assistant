// components/features/notifications/PushPermissionBannerWrapper.tsx
'use client'

import { useState, useEffect } from 'react'
import { PushPermissionBanner } from './PushPermissionBanner'

interface PushPermissionBannerWrapperProps {
  userId: string
  prescriptionCount: number
}

export function PushPermissionBannerWrapper({
  userId,
  prescriptionCount,
}: PushPermissionBannerWrapperProps) {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      // Show banner if:
      // 1. Permission is still default (not granted or denied)
      // 2. User has at least one prescription
      if (Notification.permission === 'default' && prescriptionCount > 0) {
        setShowBanner(true)
      }
    }
  }, [prescriptionCount])

  if (!showBanner) return null

  return <PushPermissionBanner userId={userId} onDismiss={() => setShowBanner(false)} />
}
