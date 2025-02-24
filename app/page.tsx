"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [journalText, setJournalText] = useState<string>("");
  const [cursorIndex, setCursorIndex] = useState<number>(0);
  const inputRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent default behavior

    if (e.key.length === 1) {
      // Insert character at cursor position
      setJournalText((prev) =>
        prev.slice(0, cursorIndex) + e.key + prev.slice(cursorIndex)
      );
      setCursorIndex((prev) => prev + 1); // Move cursor forward
    } else if (e.key === "Backspace" && cursorIndex > 0) {
      // Delete character before cursor
      setJournalText((prev) =>
        prev.slice(0, cursorIndex - 1) + prev.slice(cursorIndex)
      );
      setCursorIndex((prev) => prev - 1);
    } else if (e.key === "ArrowLeft" && cursorIndex > 0) {
      // Move cursor left but skip over '\n' if it's the next character
      let newCursorIndex = cursorIndex - 1;
      while (newCursorIndex > 0 && journalText[newCursorIndex] === "\n") {
        newCursorIndex--;
      }
      setCursorIndex(newCursorIndex);
    } else if (e.key === "ArrowRight" && cursorIndex < journalText.length) {
      // Move cursor right but skip over '\n' if it's the next character
      let newCursorIndex = cursorIndex + 1;
      while (newCursorIndex < journalText.length && journalText[newCursorIndex] === "\n") {
        newCursorIndex++;
      }
      setCursorIndex(newCursorIndex);
    } else if (e.key === "Enter") {
      // Create two new lines after the cursor
      e.preventDefault(); // Prevent default line break (in input)
      setJournalText((prev) =>
        removeExtraReturns(prev.slice(0, cursorIndex) + "\n\n" + prev.slice(cursorIndex))
      );
      setCursorIndex((prev) => prev + 2); // Move cursor to the second new line
    }
  };


  function removeExtraReturns(userText: string): string {
    // I need to turn into array  `
    for (const char of userText) {
      console.log('char ', char)
      if (char === '\n') {
        console.log(true)
      }
    }
    return userText
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [])


  return (
    <div
      ref={inputRef}
      tabIndex={0} // Makes the div focusable
      onKeyDown={handleKeyDown}
      className="w-full h-screen flex flex-col items-center justify-center bg-gray-800"
    >
      <pre className="text-lg max-w-[900px] mx-auto w-[85%] bg-gray-800 text-gray-200 border border-gray-700 rounded-md p-4 whitespace-pre-wrap">
        {journalText.slice(0, cursorIndex)}
        <span className="bg-transparent border-b border-white">
          {journalText[cursorIndex] === "\n" && journalText[cursorIndex] === "\n" ? "\n\u00A0" : journalText[cursorIndex] || "\u00A0"}
        </span>
        {journalText.slice(cursorIndex + 1)}
      </pre>
    </div>
  );
}
