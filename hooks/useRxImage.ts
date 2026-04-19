'use client'

import { useEffect, useState } from 'react'
import type { RxImageApiResponse } from '@/types'

export interface UseRxImageResult {
  imageUrl: string | null
  loading: boolean
  error: boolean
}

const RXIMAGE_ENDPOINT = 'https://rximage.nlm.nih.gov/api/rximage/1/rxnav'
const FETCH_TIMEOUT_MS = 5000

const rxImageCache = new Map<string, string | null>()
const rxImageInflight = new Map<string, Promise<string | null>>()

async function fetchRxImage(name: string): Promise<string | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const url = `${RXIMAGE_ENDPOINT}?name=${encodeURIComponent(name)}`
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) return null
    const data = (await res.json()) as RxImageApiResponse
    if (!data?.nlmRxImages || !Array.isArray(data.nlmRxImages) || data.nlmRxImages.length === 0) {
      return null
    }
    return data.nlmRxImages[0].imageUrl ?? null
  } catch {
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

export function useRxImage(medicineName: string): UseRxImageResult {
  const key = medicineName.toLowerCase().trim()
  const cached = key && rxImageCache.has(key)
  const [imageUrl, setImageUrl] = useState<string | null>(
    cached ? (rxImageCache.get(key) ?? null) : null
  )
  const [loading, setLoading] = useState(!cached && key.length > 0)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!key) {
      setImageUrl(null)
      setLoading(false)
      setError(false)
      return
    }

    if (rxImageCache.has(key)) {
      const cachedUrl = rxImageCache.get(key) ?? null
      setImageUrl(cachedUrl)
      setLoading(false)
      setError(cachedUrl === null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(false)

    let promise = rxImageInflight.get(key)
    if (!promise) {
      promise = (async () => {
        const result = await fetchRxImage(key)
        rxImageCache.set(key, result)
        rxImageInflight.delete(key)
        return result
      })()
      rxImageInflight.set(key, promise)
    }

    promise.then((result) => {
      if (cancelled) return
      setImageUrl(result)
      setLoading(false)
      setError(result === null)
    })

    return () => {
      cancelled = true
    }
  }, [key])

  return { imageUrl, loading, error }
}
