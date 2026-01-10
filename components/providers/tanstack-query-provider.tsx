'use client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export default function TanstackQueryProvider({
    children
} : {
    children: ReactNode
}) {
    // save it in a state variable so it is created once and persists across renders
    // otherwise my whole cache is reset and management breaks
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes default
                gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
                retry: 1,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                refetchOnReconnect: false,
            },
            mutations: {
                retry: 1,
            },
        },
    }));
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
