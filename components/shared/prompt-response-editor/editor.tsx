import { Textarea } from "@/components/ui/textarea";
import { Redo, Undo } from "lucide-react";
import { useRef } from "react";


export default function Editor({
    journalText,
    setJournalText,
    jotType,
    characterLimit,
    setIsTyping,
    spellCheckEnabled
}: {
    journalText: string;
    setJournalText: React.Dispatch<React.SetStateAction<string>>;
    jotType?: string;
    characterLimit?: number,
    setIsTyping?: React.Dispatch<React.SetStateAction<boolean>>;
    spellCheckEnabled: boolean,
}) {

    // History for undo and redo
    const historyRef = useRef<string[]>([]); // For storing past states (undo)
    const redoRef = useRef<string[]>([]); // For storing future states (redo)
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Undo function
    const handleUndo = () => {
        if (historyRef.current.length > 1) {
            // Pop last state from history and save it to redo stack
            const lastState = historyRef.current.pop() as string;
            redoRef.current.push(lastState); // Push the last state to redo stack
            const prevState = historyRef.current[historyRef.current.length - 1];
            setJournalText(prevState); // Update textarea content to the previous state

            if (textareaRef.current) {
                textareaRef.current.value = prevState; // Update the textarea value
            }
        }
    };

    // Redo function
    const handleRedo = () => {
        if (redoRef.current.length > 0) {
            const redoState = redoRef.current.pop() as string;
            historyRef.current.push(redoState); // Push redo state back to history
            setJournalText(redoState); // Update textarea content

            if (textareaRef.current) {
                textareaRef.current.value = redoState; // Update the textarea value
            }
        }
    };

    const editorRef = useRef<HTMLTextAreaElement | null>(null)
    // Handle text input changes
    // const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    //     if (setIsTyping) setIsTyping(true)
    //     const newContent = e.target.value;
    //     setJournalText(newContent);
    //     // Add current content to history stack for undo
    //     historyRef.current.push(newContent);
    //     redoRef.current = [];
    // };

    // This just overrides default behaviors for some keypresses (Tab Backspace and Enter)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const textarea = e.currentTarget;
        if (e.key === 'Tab') {
            // Prevent the default behavior (tab moves focus, we want to insert spaces instead)
            e.preventDefault();

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;

            const spaces = '     '; // 5 spaces
            const newValue = value.substring(0, start) + spaces + value.substring(end);

            setJournalText(newValue);

            // Set cursor position after the inserted spaces
            requestAnimationFrame(() => {
                textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
            });

        } else if (e.key === 'Backspace') {
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;

            // Only do something special if there's no selection and the user is deleting one character
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

            // Check if the character before the cursor is a newline
            const charBeforeCursor = value[start - 1];

            if (charBeforeCursor === '\n') {
                e.preventDefault(); // Block if already a newline before the cursor
            } else {
                e.preventDefault(); // Prevent default Enter behavior

                // Insert two newlines at the cursor
                const newValue = value.substring(0, start) + '\n\n' + value.substring(end);
                setJournalText(newValue);

                // Move cursor after the two newlines
                requestAnimationFrame(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + 2;
                });
            }
        }
    };

    // Handle text input changes (works on mobile keyboards)
    const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (setIsTyping) setIsTyping(true);

        let newContent = e.target.value;
        const lastContent = journalText;

        // Replace a single ending newline with double newline (for mobile keyboards)
        if (
            newContent.length > lastContent.length &&
            newContent.endsWith('\n') &&
            !lastContent.endsWith('\n')
        ) {
            newContent = newContent.slice(0, -1) + '\n\n';
        }

        // Collapse any sequence of 3+ newlines into exactly 2
        const sanitizedContent = newContent.replace(/\n{3,}/g, '\n\n');

        setJournalText(sanitizedContent);
        historyRef.current.push(sanitizedContent);
        redoRef.current = [];
    };



    return (
        <div className={`w-full mx-auto flex flex-col items-center relative mb-5`}>
            {characterLimit && <p className="text-sm absolute right-2 bottom-4">{journalText.length} / {characterLimit}</p>}
            <div className="text-xs opacity-70 text-center mb-1">
                Press TAB or click the Textbox to start typing
            </div>
            <Textarea
                onPaste={(e) => e.preventDefault()}
                maxLength={characterLimit ?? undefined}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                onDragOver={(e) => e.preventDefault()}
                className={`
                    md:text-lg bg-transparent outline-border border border-border shadow-border shadow-[inset_0px_0px_10px_0px_rgba(0,_0,_0,_0.1)] p-4 md:p-7 textarea-field-size-content
                    ${jotType === 'BLOG' ? 'min-h-48' : ''}
                `}
                value={journalText}
                onChange={handleOnChange}
                onKeyDown={handleKeyDown}  // Handle key down events
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={spellCheckEnabled}
                ref={editorRef}
            />

            <div className="flex space-x-14">
                {/* Undo Button */}
                <button onTouchStart={handleUndo} onMouseDown={handleUndo} className="p-2 hover:text-primary rounded">
                    <Undo />
                </button>

                {/* Redo Button */}
                <button onTouchStart={handleRedo} onMouseDown={handleRedo} className="p-2 hover:text-primary rounded">
                    <Redo />
                </button>
            </div>
        </div>
    );
}

