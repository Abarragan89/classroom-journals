"use client"
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getWPMClassHighScores, updateUserWpm } from '@/lib/actions/wpm.action';
import { User } from '@/types';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sampleTexts } from '@/data';

// Sample 160-word prompt
export default function TypingTest({
    classHighScores,
    userHighScore,
    classId,
    studentId
}: {
    classHighScores: User[];
    userHighScore: number;
    classId: string;
    studentId: string;
}) {

    const [started, setStarted] = useState<boolean>(false);
    const [input, setInput] = useState<string>('');
    // Ref is for data handler in the backend
    const inputRefState = useRef<string>(input);
    const [finished, setFinished] = useState(false);
    const [timer, setTimer] = useState(60);
    const [showConfetti, setShowConfetti] = useState<boolean>(false)
    const [currentHighScore, setCurrentHighScore] = useState<number>(userHighScore)
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLTextAreaElement | null>(null)
    const cursorRef = useRef<HTMLSpanElement>(null);
    const [randomSampleText, setRandomSampleText] = useState<string>('')
    const [openModal, setOpenModal] = useState<boolean>(false);
    const { width, height } = useWindowSize();

    const { data: classScores, refetch } = useQuery({
        queryKey: ['getClassHighScores', classId],
        queryFn: () => getWPMClassHighScores(classId) as unknown as User[],
        initialData: classHighScores,
    })

    useEffect(() => {
        inputRefState.current = input;
    }, [input]);

    useEffect(() => {
        if (finished) {
            endGameHandler();
        }
    }, [finished]);

    // Use Effect to handle the timer
    useEffect(() => {
        if (started) setRandomSampleText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)])
        if (started && !finished && timer > 0) {
            intervalRef.current = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current!);
                        setFinished(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(intervalRef.current!);
    }, [started]);

    const calculateWPM = (): number => {
        const correctChars = inputRefState.current
            .split('')
            .filter((char, idx) => char === randomSampleText[idx])
            .length;
        const wpm = parseFloat((correctChars / 5).toFixed(1)); // since time is always 1 min
        return wpm;
    };


    const handleStart = (): void => {
        setStarted(true);

        if (inputRef?.current) inputRef.current.focus();
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        if (!started || finished) return;

        const value = e.target.value;
        const index = value.length - 1;

        // Block extra typing beyond the sample text
        if (value.length > randomSampleText.length) return;

        // Prevent typing if the latest character is incorrect
        if (value[index] !== randomSampleText[index]) return;

        // Accept input
        setInput(value);

        // End the test early if they complete the sample
        if (value.length === randomSampleText.length) {
            setFinished(true);
            clearInterval(intervalRef.current!);
        }
    };


    const getCharClass = (char: string, index: number): string => {
        if (!input[index]) return 'opacity-40';
        if (input[index] === char) return 'opacity-100';
        return 'text-destructive';
    };

    // Restart the typing test
    function resetHandler(): void {
        setStarted(false)
        setInput('')
        setFinished(false)
        setShowConfetti(false)
        setTimer(60)
    }

    async function endGameHandler(): Promise<void> {
        const currentScore = calculateWPM();
        // Save new high score if score beaten
        if (currentScore > currentHighScore) {
            setShowConfetti(true)
            try {
                const response = await updateUserWpm(studentId, currentScore)
                if (!response.success) throw new Error('Error updating wpm highscore')
                setCurrentHighScore(currentScore)
            } catch (error) {
                console.log('error updating user highscore', error)
            } finally {
                refetch();
            }
        }
    }

    return (
        <>
            {showConfetti && (
                <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    <Confetti
                        width={width}
                        height={height}
                        numberOfPieces={1800}
                        recycle={false}
                        gravity={0.05}
                        tweenDuration={4000}
                    />
                    <div className="mt-4 bg-opacity-90 rounded-xl p-6 shadow-lg text-center z-40">
                        <h3 className="text-2xl font-bold mb-2">New High Score!</h3>
                        <p className="text-xl">{calculateWPM()} WPM!</p>
                        <Button className='mt-5' onClick={() => setShowConfetti(false)}>Done</Button>
                    </div>
                </div>
            )}
            <ResponsiveDialog
                title='High Scores'
                setIsOpen={setOpenModal}
                isOpen={openModal}
            >
                <div className="flex flex-col items-center w-full max-w-md mx-auto mt-3">
                    <div className="grid grid-cols-2 w-[90%] mx-auto text-lg font-semibold border-b-2 pb-2">
                        <p>Blogger</p>
                        <p className="text-right">WPM</p>
                    </div>

                    {classScores?.length > 0 ? (
                        classScores.map((user) => (
                            <div
                                key={user.id}
                                className="grid grid-cols-2 w-[90%] mx-auto  text-lg pt-2 border-b last:border-none"
                            >
                                <p>{user.username}</p>
                                <p className="text-right">{user.wpmSpeed}</p>
                            </div>
                        ))
                    ) : (
                        <p className="mt-4 text-gray-500">No scores available</p>
                    )}
                </div>
            </ResponsiveDialog>
            <main className="max-w-3xl mx-auto p-4 relative">
                <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => handleChange(e)}
                    className="opacity-0 absolute -top-[9999px] left-0"
                    disabled={finished}
                    placeholder="Start typing here..."
                    hidden={true}
                />

                <div className='flex justify-between items-baseline'>
                    {started && !finished && (
                        <div className="text-lg font-semibold">
                            Time left: {timer}s
                        </div>
                    )}
                    {!started && (
                        <Button
                            className='mb-3'
                            onClick={handleStart}
                        >
                            Start Typing Test
                        </Button>
                    )}
                    {finished && (
                        <Button
                            variant='secondary'
                            className='mb-3'
                            onClick={resetHandler}
                        >
                            Try Again
                        </Button>
                    )}
                    <div className='flex flex-col justify-end'>
                        <Button className='mb-3' onClick={() => setOpenModal(true)}>
                            Class Scores
                        </Button>
                        <p className='font-bold'>Highscore: <span className='font-normal'>{currentHighScore} WPM</span></p>
                    </div>
                </div>

                <div className="mt-5 text-lg tracking-widest font-mono leading-relaxed">
                    {randomSampleText?.length > 0 && randomSampleText.split('').map((char, index) => {
                        const isCursor = index === input.length;
                        const isIncorrectSpace =
                            input[index] && input[index] !== char && char === ' ';

                        return (
                            <span
                                key={index}
                                ref={isCursor ? cursorRef : null}
                                className={`
                                border-b-2 overflow-x-clip
                                ${isCursor ? 'border-primary' : 'border-transparent'}
                                ${getCharClass(char, index)}
                                `}
                            >
                                {isCursor && char === ' '
                                    ? <span className="">&nbsp;</span>
                                    : isIncorrectSpace
                                        ? <span className="text-destructive">_</span> // mark incorrect space
                                        : char}
                            </span>
                        );
                    })}
                </div>
            </main>
        </>
    );
};

