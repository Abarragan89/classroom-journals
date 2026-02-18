import { Textarea } from "@/components/ui/textarea";
import { Redo, Undo } from "lucide-react";
import { useRef, useEffect } from "react";
import { toast } from "sonner";


export default function Editor({
    journalText,
    setJournalText,
    jotType,
    characterLimit,
    setIsTyping,
    spellCheckEnabled,
    questionText,
    questionNumber,
    totalQuestions,
    isDisabled = false,
    score,
    isPreGraded = false
}: {
    journalText: string;
    setJournalText: React.Dispatch<React.SetStateAction<string>>;
    jotType?: 'BLOG' | 'ASSESSMENT';
    characterLimit?: number,
    setIsTyping?: React.Dispatch<React.SetStateAction<boolean>>;
    spellCheckEnabled: boolean,
    questionText?: string;
    questionNumber?: number;
    totalQuestions?: number;
    isDisabled?: boolean;
    score?: number;
    isPreGraded?: boolean;
}) {

    // History for undo and redo
    const historyRef = useRef<string[]>([]);
    const redoRef = useRef<string[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const editorRef = useRef<HTMLTextAreaElement | null>(null)

    // Auto-resize textarea based on content
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.style.height = 'auto'; // Reset height
            editorRef.current.style.height = `${editorRef.current.scrollHeight}px`; // Set to scrollHeight
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
        // if (!allowMultiCharInput) {

        const lengthDiff = Math.abs(newContent.length - lastContent.length);

        // If more than 1 character added, block it
        if (newContent.length > lastContent.length && lengthDiff > 6) {
            e.target.value = lastContent; // Revert to previous value
            toast.error("Please enter one character at a time.", {
                duration: 1000,
            });
            return; // Early return - don't update state
        }
        // }


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

            <Textarea
                onPaste={(e) => e.preventDefault()}
                maxLength={characterLimit ?? undefined}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                onDragOver={(e) => e.preventDefault()}
                className={`
                w-full md:text-lg bg-transparent outline-ring rounded-lg  shadow-border  custom-scrollbar max-h-[70vh] mb-5
                shadow-[inset_0_5px_20px_-5px_rgba(0,0,0,0.35),inset_0_-5px_20px_-5px_rgba(0,0,0,0.35)]
                p-6 resize-none h-max-full disabled:opacity-80 disabled:text-foreground disabled:cursor-not-allowed leading-normal  tracking-widest font-extralight text-foreground
                ${jotType === 'BLOG' ? 'min-h-48' : ''}
            `}
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
            {!isDisabled && (
                <div className="flex-center space-x-14">
                    <button onTouchStart={handleUndo} onMouseDown={handleUndo} className="p-2 hover:text-primary rounded">
                        <Undo />
                    </button>

                    <button onTouchStart={handleRedo} onMouseDown={handleRedo} className="p-2 hover:text-primary rounded">
                        <Redo />
                    </button>
                </div>
            )}
        </div>
    );
}