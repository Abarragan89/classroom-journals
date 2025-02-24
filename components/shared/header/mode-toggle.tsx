'use client'
import { Button } from "@/components/ui/button"
import { useState, useEffect } from 'react'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuContent,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { SunIcon, MoonIcon, SunMoon, ComputerIcon } from 'lucide-react'

export default function ModeToggle() {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    // Prevents Hydration Warnings/Errors
    if (!mounted) {
        return null
    }


    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className="focus-visible:ring-0 focus-visible:ring-offset-0">
                        {theme === 'tech' ? (
                            <ComputerIcon />
                        ) : theme === 'dark' ? (
                            <MoonIcon />
                        ) : <SunIcon />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-primary">
                    <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked={theme === 'tech'} onClick={() => setTheme('tech')}>
                        Tech
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={theme === 'dark'} onClick={() => setTheme('dark')}>
                        Dark
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={theme === 'light'} onClick={() => setTheme('light')}>
                        Light
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
