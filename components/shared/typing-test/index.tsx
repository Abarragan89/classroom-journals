"use client"
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { updateUserWpm } from '@/lib/actions/wpm.action';
import { User } from '@/types';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sampleTexts } from '@/data/wpmText';

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
    const [finished, setFinished] = useState<boolean>(false);
    const [needsReset, setNeedsReset] = useState<boolean>()
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
        queryFn: async () => {
            const response = await fetch(`/api/typing-test/high-scores/${classId}/${studentId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch class high scores');
            }
            const data = await response.json();
            return data.highScores as User[];
        },
        initialData: classHighScores,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    useEffect(() => {
        inputRefState.current = input;
    }, [input]);

    useEffect(() => {
        if (finished) {
            endGameHandler();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                        setNeedsReset(true)
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(intervalRef.current!);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setRandomSampleText('')
        setNeedsReset(false)
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
                console.error('error updating user highscore', error)
            } finally {
                refetch();
            }
        }
    }

    return (
        <>
            {finished && (
                <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    {showConfetti && (
                        <Confetti
                            width={width}
                            height={height}
                            numberOfPieces={1000}
                            recycle={false}
                            gravity={0.3}
                            tweenDuration={2000}
                            initialVelocityY={20}
                            initialVelocityX={5}
                            wind={0.01}
                            friction={0.99}
                        />

                    )}
                    <div className="w-[350px] mt-4 bg-card text-card-foreground rounded-xl p-6 shadow-lg text-center z-40">
                        {showConfetti ? (
                            <>
                                <h3 className="text-2xl font-bold mb-2">New High Score!</h3>
                                <p className='text-accent text-xl'>{calculateWPM()}</p>
                                <p className="text-lg">WPM!</p>
                            </>
                        ) : (
                            <>
                                <h3 className="text-2xl font-bold mb-2">Your Score</h3>
                                <p className='text-accent text-xl'>{calculateWPM()}</p>
                                <p className="text-lg">WPM</p>
                            </>
                        )}
                        <Button className='mt-5' onClick={() => { setShowConfetti(false); setFinished(false) }}>Done</Button>
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
                    tabIndex={0}
                    onChange={(e) => handleChange(e)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                        if (e.key === 'Tab') {
                            e.preventDefault(); // Prevent tabbing out
                        }
                    }}
                    className="opacity-0 absolute -top-[9999px] left-0"
                    disabled={finished}
                    placeholder="Start typing here..."
                    hidden={true}
                />

                <div className='flex justify-between items-baseline'>
                    {started && !finished && !needsReset && (
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
                    {needsReset && (
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

