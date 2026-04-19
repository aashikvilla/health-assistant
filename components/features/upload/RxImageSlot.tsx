'use client'

import { useRxImage } from '@/hooks/useRxImage'
import { MedicinePacket } from '@/components/features/explanation/MedicationCard'

interface RxImageSlotProps {
  medicineName: string
  width?: number
  height?: number
  className?: string
}

export function RxImageSlot({
  medicineName,
  width = 88,
  height = 100,
  className = '',
}: RxImageSlotProps) {
  const { imageUrl, loading } = useRxImage(medicineName)
  const wrapperClass = `shrink-0 overflow-hidden ${className || 'rounded-2xl'}`
  const style = { width, height }

  if (loading) {
    return (
      <div
        className={`${wrapperClass} bg-surface-subtle animate-pulse`}
        style={style}
        aria-hidden="true"
      />
    )
  }

  if (imageUrl) {
    return (
      <div className={wrapperClass} style={style}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={medicineName}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className={wrapperClass} style={style}>
      <MedicinePacket name={medicineName} dosage="" />
    </div>
  )
}

export default RxImageSlot
