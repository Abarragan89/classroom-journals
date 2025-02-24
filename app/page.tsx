'use client'
import { useTheme } from "next-themes"

export default function page() {

  const { theme, setTheme } = useTheme()

  return (
    <main>
      <p>Hey there</p>
      <button onClick={() => setTheme('dark')}>
        dark
      </button>
      <button onClick={() => setTheme('tech')}>
        tech
      </button>
      <button onClick={() => setTheme('light')}>
        light
      </button>
    </main>
  )
}
