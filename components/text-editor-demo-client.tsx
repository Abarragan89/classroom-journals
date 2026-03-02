"use client"
import dynamic from "next/dynamic";

const TextEditorDemoDynamic = dynamic(
    () => import("@/components/text-editor-demo"),
    { ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded-xl" /> }
);

export default function TextEditorDemoClient() {
    return <TextEditorDemoDynamic />;
}
