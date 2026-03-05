'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'

export function AuthRedirect() {
  const router = useRouter()
  const { redirectToLogin } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (redirectToLogin) {
      router.push('/login')
    }
  }, [redirectToLogin, router])

  return null
}

