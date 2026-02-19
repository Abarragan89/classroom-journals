"use client"
import Editor from '@/components/shared/prompt-response-editor/editor';
import React, { useState } from 'react'

export default function TextEditorDemo() {

    const [journalText, setJournalText] = useState<string>('');

    return (
        <>
            <main className='relative'>
                <div className='flex flex-col justify-center items-center'>
                    <h2 className='text-3xl sm:text-4xl font-bold text-center'>Meet Our Restricted Text Editor</h2>
                    <h3 className='font-bold text-sm text-center text-muted-foreground mt-3'>No distractions. Just typing.</h3>
                    <div className='mt-10 w-full max-w-[750px] relative'>
                        <div className='z-10'>
                            <Editor
                                setJournalText={setJournalText}
                                journalText={journalText}
                                spellCheckEnabled={false}
                                isVoiceToTextEnabled={false}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
