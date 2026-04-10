"use client"
import { useState, useEffect } from "react"

const phrases = [
    "Built-In AI Grading",
    "Anti-Cheat Editor",
    "No Distractions",
    "Publishable Blogs",
]

export default function AnimatedHeadline() {
    const [index, setIndex] = useState(0)
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const interval = setInterval(() => {
            setVisible(false)
            const timeout = setTimeout(() => {
                setIndex(prev => (prev + 1) % phrases.length)
                setVisible(true)
            }, 350)
            return () => clearTimeout(timeout)
        }, 3200)
        return () => clearInterval(interval)
    }, [])

    return (
        <span className="block text-primary" style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.97)',
            transition: 'opacity 350ms ease, transform 350ms ease',
        }}>
            {phrases[index]}
        </span>
    )
}
