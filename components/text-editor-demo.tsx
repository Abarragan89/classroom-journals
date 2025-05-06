"use client"
import Editor from '@/components/shared/prompt-response-editor/editor'
import React, { useState } from 'react'

export default function TextEditorDemo() {

    const [journalText, setJournalText] = useState<string>('');

    return (
        <>
            {/* <NoSignInHeader /> */}
            <main className='relative'>
                {/* <div className='flex items absolute -top-6 right-7 text-accent'>
                    Try our different themes <CornerRightUp />
                </div> */}
                <div className='flex flex-col justify-center items-center'>
                    <h2 className='h1-bold text-center'>Meet Our Restricted Text Editor</h2>
                    <h3 className='font-bold text-sm text-center'>No spell-check, word prediction, copy and paste, or distractions. Just typing.</h3>
                    <div className='mt-10 w-full max-w-[750px] relative'>
                        {/* <div className="text-xs text-accent text-center">
                            Press TAB or click the Textbox to start typing
                        </div> */}
                        <div className='z-10'>
                            <Editor
                                setJournalText={setJournalText}
                                journalText={journalText}
                            />
                        </div>
                        {/* Explaining the move cursor arrow */}
                        {/* <div className='absolute -left-2 -bottom-8 flex flex-col items-start z-0'>
                            <div className='w-[220px] border-2 border-accent rounded-full h-16'>
                            </div>
                            <div className="flex items-baseline ml-20">
                                <CornerLeftUp
                                    className='text-accent'
                                    size={30}
                                />
                                <p className='text-sm font-bold text-accent'>
                                    Move cursor
                                </p>
                            </div>
                        </div> */}
                        {/* Explaining the new Paragraph */}
                        {/* <div className='absolute -bottom-8 right-0 flex flex-col items-end z-0'>
                            <div className='w-[110px] border-2 border-accent rounded-full h-16'>
                            </div>
                            <div className="flex items-baseline mr-12">
                                <p className='text-sm font-bold text-accent'>
                                    New Paragraph
                                </p>
                                <CornerRightUp
                                    className='text-accent'
                                    size={30}
                                />
                            </div>
                        </div> */}
                    </div>
                </div>
            </main>
        </>
    )
}
