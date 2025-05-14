"use client"
import { Textarea } from '@/components/ui/textarea';
import React, { useState, useEffect, useRef } from 'react';

// Sample 160-word prompt
const sampleText = `The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet and is often used to test typing skills. Practicing with such sentences can help improve typing speed and accuracy. Consistent practice is key to becoming proficient at typing. Remember to maintain proper posture and hand positioning while typing. Take regular breaks to avoid strain. Typing is an essential skill in the digital age, aiding in communication and productivity. By focusing on accuracy first, speed will naturally increase over time. Utilize typing software and games to make practice engaging. Set achievable goals and track your progress. Celebrate small milestones to stay motivated. Typing efficiently can save time and enhance your workflow. Embrace the learning process and be patient with yourself. Overcoming challenges in typing can boost confidence. Share your progress with others to stay accountable. Keep practicing, and you'll see improvement. Happy typing!`;

const TypingTest = () => {
    const [started, setStarted] = useState<boolean>(false);
    const [input, setInput] = useState<string>('');
    // const [startTime, setStartTime] = useState<>(null);
    const [wpm, setWpm] = useState<string>('');
    const [finished, setFinished] = useState(false);
    const [timer, setTimer] = useState(60);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLTextAreaElement | null>(null)

    useEffect(() => {
        if (started && !finished && timer > 0) {
            intervalRef.current = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current!);
                        setFinished(true);
                        calculateWPM();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(intervalRef.current!);
    }, [started]);

    const calculateWPM = () => {
        const numChars = input.length;
        const wpm = (numChars / 5).toFixed(1); // since time is always 1 min
        setWpm(wpm);
    };

    const handleStart = () => {
        setStarted(true);
        if (inputRef?.current) inputRef.current.focus();
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!started || finished) return;
        const value = e.target.value;
        if (value.length > sampleText.length) return;
        setInput(value);

        if (value.length === sampleText.length) {
            setFinished(true);
            clearInterval(intervalRef.current!);
            calculateWPM();
        }
    };

    const getCharClass = (char: string, index: number) => {
        if (!input[index]) return 'text-gray-400';
        if (input[index] === char) return 'text-black';
        return 'text-red-500';
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <div className="text-lg font-semibold mt-4">
                Time left: {timer}s
            </div>
            {!started && (
                <button
                    onClick={handleStart}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Start Typing Test
                </button>
            )}
            <div className="mt-4 text-xl leading-relaxed">
                {sampleText.split('').map((char, index) => (
                    <span
                        key={index}
                        className={`${getCharClass(char, index)} ${index === input.length ? 'bg-yellow-200' : ''
                            }`}
                    >
                        {char}
                    </span>
                ))}
            </div>
            <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => handleChange(e)}
                className="w-full h-32 mt-4 p-2 border border-gray-300 rounded"
                disabled={finished}
                placeholder="Start typing here..."
            />
            {finished && (
                <div className="mt-4 text-lg">
                    <p>Your WPM: <strong>{wpm}</strong></p>
                </div>
            )}
        </div>
    );
};

export default TypingTest;
