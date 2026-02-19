import { Textarea } from "@/components/ui/textarea";
import { Redo, Undo, Minimize2, HelpCircle, Expand, Maximize2 } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/responsive-dialog";


export default function Editor({
    journalText,
    setJournalText,
    jotType,
    characterLimit,
    setIsTyping,
    spellCheckEnabled,
    isVoiceToTextEnabled,
    questionText,
    questionNumber,
    totalQuestions,
    isDisabled = false,
    score,
    isPreGraded = false,
    onSave
}: {
    journalText: string;
    setJournalText: React.Dispatch<React.SetStateAction<string>>;
    jotType?: 'BLOG' | 'ASSESSMENT';
    characterLimit?: number,
    setIsTyping?: React.Dispatch<React.SetStateAction<boolean>>;
    spellCheckEnabled: boolean,
    isVoiceToTextEnabled: boolean,
    questionText?: string;
    questionNumber?: number;
    totalQuestions?: number;
    isDisabled?: boolean;
    score?: number;
    isPreGraded?: boolean;
    onSave?: () => void | Promise<void>;
}) {

    // History for undo and redo
    const historyRef = useRef<string[]>([]);
    const redoRef = useRef<string[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const editorRef = useRef<HTMLTextAreaElement | null>(null)
    const [showQuestionDialog, setShowQuestionDialog] = useState(false);

    // Fullscreen mode state
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Hide body scrollbar in fullscreen mode
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isFullscreen]);

    // Auto-resize textarea based on content
    // Fallback for browsers that don't support field-sizing
    useEffect(() => {
        if (editorRef.current && typeof CSS !== 'undefined' && !CSS.supports('field-sizing', 'content')) {
            const scrollY = window.scrollY;
            editorRef.current.style.height = 'auto'; // Reset height
            editorRef.current.style.height = `${editorRef.current.scrollHeight}px`; // Set to scrollHeight
            window.scrollTo(0, scrollY); // Restore scroll position to prevent jumping
        }
    }, [journalText]);

    // Undo function
    const handleUndo = () => {
        if (historyRef?.current?.length > 1) {
            const lastState = historyRef.current.pop() as string;
            redoRef.current.push(lastState);
            const prevState = historyRef.current[historyRef?.current?.length - 1];
            setJournalText(prevState);

            if (textareaRef.current) {
                textareaRef.current.value = prevState;
            }
        }
    };

    // Redo function
    const handleRedo = () => {
        if (redoRef?.current?.length > 0) {
            const redoState = redoRef.current.pop() as string;
            historyRef.current.push(redoState);
            setJournalText(redoState);

            if (textareaRef.current) {
                textareaRef.current.value = redoState;
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const textarea = e.currentTarget;
        if (e.key === 'Tab') {
            e.preventDefault();

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;

            const spaces = '     ';
            const newValue = value.substring(0, start) + spaces + value.substring(end);

            setJournalText(newValue);

            requestAnimationFrame(() => {
                textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
            });

        } else if (e.key === 'Backspace') {
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;

            if (start === end && start >= 2) {
                const charsBefore = value.substring(start - 2, start);
                if (charsBefore === '\n\n') {
                    e.preventDefault();

                    const newValue = value.substring(0, start - 2) + value.substring(end);
                    setJournalText(newValue);

                    requestAnimationFrame(() => {
                        textarea.selectionStart = textarea.selectionEnd = start - 2;
                    });
                    return;
                }
            }
        } else if (e.key === 'Enter') {
            const value = textarea.value;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            if (start === 0) {
                e.preventDefault();
                return;
            }

            const charBeforeCursor = value[start - 1];

            if (charBeforeCursor === '\n') {
                e.preventDefault();
            } else {
                e.preventDefault();

                const newValue = value.substring(0, start) + '\n\n' + value.substring(end);
                setJournalText(newValue);

                requestAnimationFrame(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + 2;
                });
            }
        }
    };

    const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (setIsTyping) setIsTyping(true);

        let newContent = e.target.value;
        const lastContent = journalText;

        // unless allowMultiCharInput is enabled (for voice typing, IME, etc.)
        if (!isVoiceToTextEnabled) {
            const lengthDiff = Math.abs(newContent.length - lastContent.length);
            // If more than 1 character added, block it
            if (newContent.length > lastContent.length && lengthDiff > 6) {
                e.target.value = lastContent; // Revert to previous value
                toast.error("Please enter one character at a time.", {
                    duration: 1000,
                });
                return; // Early return - don't update state
            }
        }


        if (
            newContent?.length > lastContent?.length &&
            newContent.endsWith('\n') &&
            !lastContent.endsWith('\n')
        ) {
            newContent = newContent.slice(0, -1) + '\n\n';
        }

        const sanitizedContent = newContent.replace(/\n{3,}/g, '\n\n');

        setJournalText(sanitizedContent);
        historyRef.current.push(sanitizedContent);
        redoRef.current = [];
    };

    function displayGradeUI(score: number) {
        switch (score) {
            case 0:
                return <p className='text-destructive text-sm font-bold'>Wrong</p>;
            case 0.5:
                return <p className='text-warning text-sm font-bold'>Half Credit</p>;
            case 1:
                return <p className='text-success text-sm font-bold'>Correct</p>;
        }
    }


    // Fullscreen view
    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-50 bg-background overflow-hidden">
                <Textarea
                    onPaste={(e) => e.preventDefault()}
                    maxLength={characterLimit ?? undefined}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                    onDragOver={(e) => e.preventDefault()}
                    className="w-full mx-auto h-full rounded-none bg-transparent border-none outline-none custom-scrollbar px-6 pt-20 md:px-14 lg:px-16 resize-none disabled:opacity-80 disabled:text-foreground disabled:cursor-not-allowed leading-normal tracking-widest font-extralight text-foreground md:text-lg shadow-[inset_0_5px_20px_1px_rgba(0,0,0,0.5),inset_0_-5px_20px_1px_rgba(0,0,0,0.5)]"
                    style={{
                        fieldSizing: 'content',
                        minHeight: '100vh',
                        paddingBottom: '20rem',
                        scrollPaddingBottom: '3rem'
                    }}
                    value={journalText}
                    onChange={handleOnChange}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={spellCheckEnabled}
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                    data-form-type="other"
                    placeholder={isDisabled ? "" : "Enter your response here..."}
                    ref={editorRef}
                    disabled={isDisabled}
                    autoFocus
                />

                {/* Fixed toolbar */}
                <div className="fixed top-7 right-4 flex items-center gap-2">
                    {onSave && (
                        <Button onClick={onSave} variant="default" size="sm">
                            Save
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="icon"
                        onTouchStart={handleUndo}
                        onMouseDown={handleUndo}
                    >
                        <Undo className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onTouchStart={handleRedo}
                        onMouseDown={handleRedo}
                    >
                        <Redo className="h-4 w-4" />
                    </Button>

                    {questionText && (
                        <>
                            <ResponsiveDialog
                                title={questionNumber && totalQuestions ? `Question ${questionNumber} of ${totalQuestions}` : 'Question'}
                                isOpen={showQuestionDialog}
                                setIsOpen={setShowQuestionDialog}
                            >
                                <p className="whitespace-pre-line text-base leading-relaxed tracking-wide max-h-[50vh] overflow-y-auto custom-scrollbar">{questionText}</p>
                            </ResponsiveDialog>
                            <Button onClick={() => setShowQuestionDialog(true)} variant="outline" size="sm" className="gap-2">
                                <HelpCircle className="h-4 w-4" />
                                View Question
                            </Button>
                        </>
                    )}

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsFullscreen(false)}
                    >
                        <Minimize2 className="h-4 w-4" />
                    </Button>
                </div>

                {/* Character count in fullscreen */}
                {!isDisabled && characterLimit && (
                    <p className="fixed bottom-4 right-4 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-md">
                        {journalText?.length} / {characterLimit}
                    </p>
                )}
            </div>
        );
    }

    // Normal view
    return (
        <div className={`w-full mx-auto relative bg-card rounded-md p-8 pb-3 border`}>

            {jotType === 'ASSESSMENT' && !isPreGraded && (
                <div className="absolute top-3 left-9">
                    {score !== undefined ? displayGradeUI(score) : <p className="text-sm italic text-muted-foreground ">Not Graded</p>}
                </div>
            )}

            {questionNumber && totalQuestions && (
                <p className="absolute top-3 right-5 text-xs text-muted-foreground">
                    Question {questionNumber} of {totalQuestions}
                </p>
            )}


            {questionText && (
                <p className="pt-5 pb-7 ml-1 whitespace-pre-line lg:text-lg font-medium leading-relaxed tracking-wider">{questionText}</p>
            )}

            {!isDisabled && characterLimit && (
                <p className="text-sm w-fit text-right text-muted-foreground absolute right-9 bottom-10">{journalText?.length} / {characterLimit}</p>
            )}
            <div className="relative">

                <Textarea
                    onPaste={(e) => e.preventDefault()}
                    maxLength={characterLimit ?? undefined}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                    onDragOver={(e) => e.preventDefault()}
                    className={`
                w-full md:text-lg relative bg-transparent outline-ring rounded-lg  shadow-border  custom-scrollbar max-h-[70vh] mb-5
                shadow-[inset_0_5px_20px_-5px_rgba(0,0,0,0.35),inset_0_-5px_20px_-5px_rgba(0,0,0,0.35)]
                p-6 resize-none h-max-full disabled:opacity-80 disabled:text-foreground disabled:cursor-not-allowed leading-normal  tracking-widest font-extralight text-foreground
                ${jotType === 'BLOG' ? 'min-h-48' : ''}
            `}
                    style={{
                        fieldSizing: 'content',
                        minHeight: jotType === 'BLOG' ? '12rem' : '8rem',
                        paddingBottom: '3rem',
                        scrollPaddingBottom: '3rem'
                    }}
                    value={journalText}
                    onChange={handleOnChange}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={spellCheckEnabled}
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                    data-form-type="other"
                    placeholder={isDisabled ? "" : "Enter your response here..."}
                    ref={editorRef}
                    disabled={isDisabled}
                />
                {/* Fullscreen toggle button */}
                {!isDisabled && jotType === "BLOG" && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 z-50"
                        onClick={() => setIsFullscreen(true)}
                    >
                        <Maximize2 size={15} />
                    </Button>
                )}
            </div>
            {!isDisabled && (
                <div className="flex-center space-x-14">
                    <Button variant={"ghost"} onTouchStart={handleUndo} onMouseDown={handleUndo}>
                        <Undo />
                    </Button>

                    <Button variant={"ghost"} onTouchStart={handleRedo} onMouseDown={handleRedo}>
                        <Redo />
                    </Button>
                </div>
            )}
        </div>
    );
}