import { useRef } from "react";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { MdKeyboardArrowRight } from "react-icons/md";
import { MdOutlineSubdirectoryArrowLeft } from "react-icons/md";


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
        } else if (e.key === "Enter" && !journalText.endsWith("\n\n")) {
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

    function moveCursor(spaces: number, direction: string) {
        console.log('cursor index ', cursorIndex)
        if (direction === 'back' && cursorIndex > 0) {
            setCursorIndex((prev) => prev - spaces >= 0 ? prev - spaces : 0)
        } else if (direction === 'forward' && cursorIndex < journalText.length) {
            setCursorIndex((prev) => prev + spaces <= journalText.length ? prev + spaces : journalText.length)
        }
        hiddenInputRef?.current?.focus()
    }
    
    
    console.log('cursor index ', cursorIndex)

    function makeNewParagraph() {
        let updatedText = journalText;
        let updatedCursor = cursorIndex;
        if (!journalText.endsWith("\n\n")) {
            updatedText = journalText?.slice(0, cursorIndex) + "\n\n" + journalText.slice(cursorIndex);
            updatedCursor += 2;
        }
        setJournalText(updatedText);
        setCursorIndex(updatedCursor);
        hiddenInputRef?.current?.focus()
    }

    return (
        <div className={`${isInReview ? '' : 'mb-5'} w-full mx-auto flex flex-col items-center relative`}>
            <div
                ref={inputRef}
                tabIndex={0}
                onClick={() => hiddenInputRef.current?.focus()} // Focus input when div is clicked
                className={`mx-auto w-full rounded-md outline-none mt-5
                    ${jotType === 'single-question' ? 'min-h-48 ' : ''}
                    ${isInReview ? '' : 'border-2 border-bg-accent'}
                `}
            >
                <pre className="whitespace-pre-wrap w-full p-5">
                    {journalText?.slice(0, cursorIndex)}
                    <span className="bg-transparent border-b-2 border-b-primary">
                        {journalText[cursorIndex] === "\n" ? "\n\u00A0" : journalText[cursorIndex] || "\u00A0"}
                    </span>
                    {journalText?.slice(cursorIndex + 1)}
                </pre>
            </div>
            {/* Hidden input to capture mobile text input */}
            <input
                ref={hiddenInputRef}
                type="text"
                onKeyDown={handleKeyDown} // ← use this
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                className="absolute opacity-0 pointer-events-none"
            />
            {!isInReview && <p className="text-xs text-center mt-1 italic absolute">Click in the box to start typing</p>}
            {!isInReview && <p className="text-xs mt-1 flex">Use ARROW keys to move cursor (Mobile controls below):</p>}
            <div className="flex-between mt-2 w-full">
                <div className="flex">
                    <div className="flex-start">
                        <MdKeyboardDoubleArrowLeft
                            onClick={() => moveCursor(10, 'back')}
                            size={25}
                            className="border border-border rounded-sm mx-3 hover:cursor-pointer hover:text-input"
                        />
                        <MdKeyboardArrowLeft
                            onClick={() => moveCursor(1, 'back')}
                            size={25}
                            className="border border-border rounded-sm mx-3 hover:cursor-pointer hover:text-input"
                        />
                    </div>
                    <div className="flex-start">
                        <MdKeyboardArrowRight
                            onClick={() => moveCursor(1, 'forward')}
                            size={25}
                            className="border border-border rounded-sm mx-3 hover:cursor-pointer hover:text-input"
                        />
                        <MdKeyboardDoubleArrowRight
                            onClick={() => moveCursor(10, 'forward')}
                            size={25}
                            className="border border-border rounded-sm mx-3 hover:cursor-pointer hover:text-input"
                        />
                    </div>
                </div>
                <MdOutlineSubdirectoryArrowLeft
                    onClick={makeNewParagraph}
                    className="border border-border rounded-sm mx-3 w-20 hover:cursor-pointer hover:text-input"
                    size={25}
                />
            </div>

        </div>
    );
}

