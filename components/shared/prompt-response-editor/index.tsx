"use client";
import { Question } from "@/types";
import { useState, useRef, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import SaveAndContinueBtns from "@/components/buttons/save-and-continue";
import { saveFormData, getFormData } from "@/lib/indexed.db.actions";
import { useRouter } from "next/navigation";

export default function PromptResponseEditor({
    questions,
}: {
    questions: Question[]
}) {

    const searchParams = useSearchParams();
    const questionNumber = searchParams.get('q') as string;
    const { promptSessionId } = useParams();
    const router = useRouter();
    const inputRef = useRef<HTMLDivElement>(null);

    console.log('question ', questions)

    const [journalText, setJournalText] = useState<string>("");
    const [cursorIndex, setCursorIndex] = useState<number>(0);
    const [allQuestions, setAllQuestions] = useState<Question[]>(questions);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState(false); // Track user typing

    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);


    async function getSavedText() {
        try {
            const savedResponse = await getFormData(promptSessionId as string)
            const isThereResponse = savedResponse.questions[Number(questionNumber)].answer
            const savedText = savedResponse.questions[Number(questionNumber)].answer || "";
            setCursorIndex(savedText.length); // Move cursor to end of text

            if (!savedResponse || !isThereResponse) {
                return
            }
            setAllQuestions(savedResponse.questions)
            setJournalText(savedResponse.questions[Number(questionNumber)].answer);
        } catch (error) {
            console.log('error getting saved data in indexedb', error)
        }

    }
    useEffect(() => {
        if (questionNumber && questions) {
            setCurrentQuestion(questions[Number(questionNumber)].question)
            getSavedText()
        }
    }, [questionNumber, questions])

    /** Auto-save logic */
    useEffect(() => {
        if (!isTyping) return
        if (isTyping) {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                handleSaveResponses();
                setIsTyping(false);
            }, 2000); // Save after 10 seconds of inactivity
        }
        return () => clearTimeout(typingTimeoutRef.current);
    }, [journalText]);


    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        e.preventDefault(); // Prevent default behavior

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


    function removeExtraReturns(userText: string): string {
        // I need to turn into array  `
        for (const char of userText) {
            if (char === '\n') {
            }
        }
        return userText
    }

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    async function handleSaveResponses() {
        try {
            setIsSaving(true)

            setAllQuestions((prev) => {
                const updatedQuestions = prev.map((q, index) =>
                    index === Number(questionNumber)
                        ? { question: currentQuestion, answer: journalText }
                        : q
                );

                // Save the updated state immediately
                saveFormData(updatedQuestions, promptSessionId);

                return updatedQuestions; // Ensure React updates the state correctly
            });
        } catch (error) {
            console.log('error saving to indexed db', error)
        } finally {
            setTimeout(() => {
                setIsSaving(false)
            }, 800);
        }
    }

    async function saveAndContinue(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            await handleSaveResponses();
            const nextQuestion = (Number(questionNumber) + 1).toString()
            setJournalText('');
            router.push(`/jot-response/${promptSessionId}?q=${nextQuestion}`)
            inputRef.current?.focus()
        } catch (error) {
            console.log('error saving and continuing ', error)
        }
    }

    console.log('all questions ', allQuestions)


    return (
        <>
            <p className="h2-bold mt-16 mb-16 w-11/12 mx-auto text-center">{currentQuestion}</p>
            <div className="mb-20 w-11/12 mx-auto flex flex-col items-center">
                <div
                    ref={inputRef}
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    className="w-full border-2 border-bg-accent rounded-lg outline-none"
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
            <form onSubmit={(e) => saveAndContinue(e)} className="mt-16">
                <SaveAndContinueBtns
                    isSaving={isSaving}
                    submitHandler={handleSaveResponses}
                />
            </form>
        </>
    );
}
