"use client"
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type BlogMetaDetails from "@/components/blog-meta-details";

const BlogMetaDetailsDynamic = dynamic(
    () => import("@/components/blog-meta-details"),
    { ssr: false, loading: () => <div className="h-12 animate-pulse bg-muted rounded" /> }
);

export default function BlogMetaDetailsClient(props: ComponentProps<typeof BlogMetaDetails>) {
    return <BlogMetaDetailsDynamic {...props} />;
}
