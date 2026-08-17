'use client'

import { useState } from 'react'

export type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

export function useInquirySubmit(endpoint: string) {
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const submit = async (data: unknown): Promise<boolean> => {
    setStatus('submitting')
    setError(null)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(json.error || 'Something went wrong. Please try again.')
        setStatus('error')
        return false
      }
      setStatus('success')
      return true
    } catch {
      setError('Network error. Please check your connection and try again.')
      setStatus('error')
      return false
    }
  }

  return { submit, status, error }
}
