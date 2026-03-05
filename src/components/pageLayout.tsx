import React, { ReactNode, useState } from "react"
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon } from 'lucide-react'

interface PageLayoutProps {
  children: ReactNode
  title: string
}

export function PageLayout({ children, title }: PageLayoutProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className="flex bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-white dark:bg-gray-800 px-6">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto py-4">
          {children}
        </main>
      </div>
    </div>
  )
}

