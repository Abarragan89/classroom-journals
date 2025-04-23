"use client"
import NoSignInHeader from '@/components/shared/header/no-signin-header';
import Editor from '@/components/shared/prompt-response-editor/editor'
import React, { useRef, useState } from 'react'
import { CornerRightUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function TextEditorDemoPage() {

    const [journalText, setJournalText] = useState<string>('');
    const inputRef = useRef<HTMLDivElement>(null);
    return (
        <>
            <NoSignInHeader />
            <main className='wrapper relative'>
                <div className='flex items absolute -top-6 right-7 text-accent'>
                    Try our different themes <CornerRightUp />
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <h1 className='h1-bold'>Restricted Text Editor</h1>
                    <h3 className='font-bold'>No distractions, just typing</h3>
                    <div className='mt-20 w-full max-w-[750px]'>
                        <div className="text-xs text-accent text-center">
                            Press TAB or click the Textbox to start typing
                        </div>
                        <Editor
                            setJournalText={setJournalText}
                            journalText={journalText}
                            inputRef={inputRef}
                        />
                        <Separator className='mt-20 mb-6' />
                        <h3 className='h3-bold text-center'>How to Use</h3>
                    </div>
                </div>
            </main>
        </>
    )
}
