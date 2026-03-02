"use client"
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type CommentSection from "@/components/shared/comment-section";

const CommentSectionDynamic = dynamic(
    () => import("@/components/shared/comment-section"),
    { ssr: false, loading: () => null }
);

export default function CommentSectionClient(props: ComponentProps<typeof CommentSection>) {
    return <CommentSectionDynamic {...props} />;
}
