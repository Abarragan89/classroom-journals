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
import { SunIcon, MoonIcon, ComputerIcon, Heart, Sprout } from 'lucide-react'
import { FaUserTie } from "react-icons/fa";
import { PiNewspaperClipping } from "react-icons/pi";


export default function ModeToggle() {
    const [mounted, setMounted] = useState<boolean>(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    // Prevents Hydration Warnings/Errors
    if (!mounted) {
        return null
    }

    function showModeIcon(theme: string | undefined) {
        if (!theme) return <SunIcon />
        switch (theme) {
            case 'tech':
                return <ComputerIcon />
            case 'dark':
                return <MoonIcon />
            case 'cupid':
                return <Heart />
            case 'light':
                return <PiNewspaperClipping />
            case 'tuxedo':
                return <FaUserTie />
            case 'avocado':
                return <Sprout />
            case 'sky':
                return <Sprout />

        }
    }

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className="focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full px-[10px] py-2">
                        {showModeIcon(theme)}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Themes</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked={theme === 'tech'} onClick={() => setTheme('tech')}>
                        <ComputerIcon size={12} className="mr-2" /> Tech
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={theme === 'dark'} onClick={() => setTheme('dark')}>
                        <MoonIcon size={12} className="mr-2" /> Dark
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={theme === 'light'} onClick={() => setTheme('light')}>
                        <PiNewspaperClipping size={12} className="mr-2" /> Paper
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={theme === 'cupid'} onClick={() => setTheme('cupid')}>
                        <Heart size={12} className="mr-2" /> Cupid
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={theme === 'tuxedo'} onClick={() => setTheme('tuxedo')}>
                        <FaUserTie size={12} className="mr-2" /> Tuxedo
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={theme === 'avocado'} onClick={() => setTheme('avocado')}>
                        <Sprout size={12} className="mr-2" /> Avocado
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={theme === 'sky'} onClick={() => setTheme('sky')}>
                        <Sprout size={12} className="mr-2" /> Sky
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
