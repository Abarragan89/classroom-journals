export default function Editor({
    journalText,
    setJournalText,
    setIsTyping,
    cursorIndex,
    setCursorIndex,
    inputRef,
    jotType,
    characterLimit
}: {
    journalText: string;
    setJournalText: React.Dispatch<React.SetStateAction<string>>;
    setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
    cursorIndex: number;
    setCursorIndex: React.Dispatch<React.SetStateAction<number>>;
    inputRef: React.RefObject<HTMLDivElement | null>;
    jotType?: string;
    characterLimit?: number
}) {

    function removeExtraReturns(userText: string): string {
        // I need to turn into array  `
        for (const char of userText) {
            if (char === '\n') {
            }
        }
        return userText
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        e.preventDefault(); // Prevent default behavior
        if (characterLimit && characterLimit <= cursorIndex && e.key !== "Backspace") {
            return
        }

        let updatedText = journalText;
        let updatedCursor = cursorIndex;

        if (e.key.length === 1) {
            // Insert character at cursor position
            updatedText =
                journalText.slice(0, cursorIndex) +
                e.key +
                journalText.slice(cursorIndex);
            updatedCursor++;
        } else if (e.key === "Backspace" && cursorIndex > 0) {
            // Delete character before cursor
            updatedText =
                journalText.slice(0, cursorIndex - 1) +
                journalText.slice(cursorIndex);
            updatedCursor--;
        } else if (e.key === "Enter") {
            updatedText =
                journalText.slice(0, cursorIndex) +
                "\n\n" +
                journalText.slice(cursorIndex);
            updatedCursor += 2;
        } else if (e.key === "ArrowLeft") {
            // Move cursor left
            if (cursorIndex > 0) {
                updatedCursor--;
            }
        } else if (e.key === "ArrowRight") {
            // Move cursor right
            if (cursorIndex < updatedText.length) {
                updatedCursor++;
            }
        } else {
            return; // Ignore other keys (arrows, function keys, etc.)
        }

        const formatteedText = removeExtraReturns(updatedText)
        setJournalText(formatteedText);
        setCursorIndex(updatedCursor);
        setIsTyping(true);
    };
    return (
        <div className="mb-10 w-full mx-auto flex flex-col items-center">
            <div
                ref={inputRef}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                className={`mx-auto ${jotType === 'single-question' ? 'min-h-96 ' : ''} w-full border-2 border-bg-accent rounded-md outline-none`}
            >
                <pre className="text-lg w-full p-5 whitespace-pre-wrap">
                    {journalText.slice(0, cursorIndex)}
                    <span className="bg-transparent border-b border-b-primary">
                        {journalText[cursorIndex] === "\n" && journalText[cursorIndex] === "\n" ? "\n\u00A0" : journalText[cursorIndex] || "\u00A0"}
                    </span>
                    {journalText.slice(cursorIndex + 1)}
                </pre>
            </div>
            <p className="text-sm text-center mt-2 italic">click in the box to start typing</p>
        </div>
    )
}
