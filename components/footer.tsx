import { APP_NAME } from "@/lib/constants"
import Link from "next/link";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t print:hidden">
            <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm max-w-5xl mx-auto w-full">
                <div className="text-center md:text-left">
                    &copy; {currentYear} {APP_NAME}. All rights reserved.
                </div>
                <div className="flex flex-wrap gap-4 justify-center md:justify-end">
                    <Link href="/terms-of-service" className="hover:underline text-gray-600">
                        Terms of Service
                    </Link>
                    <Link href="/privacy-policy" className="hover:underline text-gray-600">
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </footer>
    )
}
