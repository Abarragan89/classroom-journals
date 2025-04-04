import { useRef } from "react";

export default function Editor({
    journalText,
    setJournalText,
    // setIsTyping,
    cursorIndex,
    setCursorIndex,
    inputRef,
    jotType,
    characterLimit,
    isInReview = false
}: {
    journalText: string;
    setJournalText: React.Dispatch<React.SetStateAction<string>>;
    // setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
    cursorIndex: number;
    setCursorIndex: React.Dispatch<React.SetStateAction<number>>;
    inputRef: React.RefObject<HTMLDivElement | null>;
    jotType?: string;
    characterLimit?: number,
    isInReview?: boolean
}) {
    const hiddenInputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        e.preventDefault(); // Prevent default behavior
        if (characterLimit && characterLimit <= cursorIndex && e.key !== "Backspace") {
            return;
        }

        let updatedText = journalText;
        let updatedCursor = cursorIndex;

        if (e.key.length === 1) {
            updatedText = journalText.slice(0, cursorIndex) + e.key + journalText.slice(cursorIndex);
            updatedCursor++;
        } else if (e.key === "Backspace" && cursorIndex > 0) {
            updatedText = journalText.slice(0, cursorIndex - 1) + journalText.slice(cursorIndex);
            updatedCursor--;
        } else if (e.key === "Enter") {
            updatedText = journalText.slice(0, cursorIndex) + "\n\n" + journalText.slice(cursorIndex);
            updatedCursor += 2;
        } else if (e.key === "ArrowLeft" && cursorIndex > 0) {
            updatedCursor--;
        } else if (e.key === "ArrowRight" && cursorIndex < updatedText.length) {
            updatedCursor++;
        } else {
            return;
        }

        setJournalText(updatedText);
        setCursorIndex(updatedCursor);
    };

    // Handle mobile input (captures text input)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setJournalText(e.target.value);
        setCursorIndex(e.target.value.length);
    };

    return (
        <div className={`${isInReview ? '' : 'mb-5'} w-full mx-auto flex flex-col items-center`}>
            <div
                ref={inputRef}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onClick={() => hiddenInputRef.current?.focus()} // Focus input when div is clicked
                className={`mx-auto w-full rounded-md outline-none
                    ${jotType === 'single-question' ? 'min-h-48 ' : ''}
                    ${isInReview ? '' : 'border-2 border-bg-accent '}
                `}
            >
                <pre className="whitespace-pre-wrap w-full text-lg p-5">
                    {journalText.slice(0, cursorIndex)}
                    <span className="bg-transparent border-b border-b-primary">
                        {journalText[cursorIndex] === "\n" ? "\n\u00A0" : journalText[cursorIndex] || "\u00A0"}
                    </span>
                    {journalText.slice(cursorIndex + 1)}
                </pre>
            </div>
            {/* Hidden input to capture mobile text input */}
            <input
                ref={hiddenInputRef}
                type="text"
                value={journalText}
                onChange={handleInputChange}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                className="absolute opacity-0 pointer-events-none"
            />

            {!isInReview && <p className="text-sm text-center mt-2 italic">Click in the box to start typing</p>}
        </div>
    );
}

