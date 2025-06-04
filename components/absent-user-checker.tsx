"use client"
import { useEffect, useState } from 'react'
import { useIdleTimer } from 'react-idle-timer'

export default function AbsentUserChecker() {
    const REDIRECT_URL = "https://abarragan89.github.io/jotter-blog-still-there/";
    const [state, setState] = useState<string>('Active')
    const [count, setCount] = useState<number>(0)
    const [remaining, setRemaining] = useState<number>(10000)

    const onIdle = () => {
        setState('Idle')
    }

    const onActive = () => {
        setState('Active')
    }

    const onAction = () => {
        setCount(count + 1)
    }

    const { getRemainingTime } = useIdleTimer({
        onIdle,
        onActive,
        onAction,
        timeout: 10_000,
        throttle: 1000
    })

    useEffect(() => {
        const interval = setInterval(() => {
            const secs = Math.ceil(getRemainingTime() / 1000);
            if (secs !== remaining) {
                setRemaining(secs);
            }
            if (secs <= 0) {
                window.location.href = REDIRECT_URL;
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [remaining]);


    console.log('remianing ', remaining)
    console.log('state ', state)
    return null
}
