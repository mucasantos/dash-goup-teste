'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

const RouterContext = createContext<ReturnType<typeof useRouter> | null>(null)

export const RouterProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  return <RouterContext.Provider value={router}>{children}</RouterContext.Provider>
}

export const useAppRouter = () => {
  const context = useContext(RouterContext)
  if (!context) {
    throw new Error('useAppRouter must be used within a RouterProvider')
  }
  return context
}

