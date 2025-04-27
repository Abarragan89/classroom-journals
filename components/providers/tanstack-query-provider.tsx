'use client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export default function TanstackQueryProvider({
    children
} : {
    children: ReactNode
}) {
    // save it in a state variable so it is created once adn persists across renders
    // otherwise my whole cache is reset and management breaks
    const [queryClient] = useState(() => new QueryClient());
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
