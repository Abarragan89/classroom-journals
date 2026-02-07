'use client'
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import TutorialModal from '../modals/tutorial-modal';
import JotTutorialArrow from './jot-tutorial-arrow';
import { User } from '@/types';

export default function TutorialFlowWrapper({
    tutorialStep,
    classId,
    teacherId,
    initialStudentCount
}: {
    tutorialStep?: string,
    classId: string,
    teacherId: string,
    initialStudentCount: number
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [currentStep, setCurrentStep] = useState(tutorialStep);

    // Use the same query as RosterTable to get cached student count
    const { data: allStudents } = useQuery({
        queryKey: ['getStudentRoster', classId],
        queryFn: async () => {
            const response = await fetch(`/api/classroom?classId=${classId}&teacherId=${teacherId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch student roster');
            }
            const { students } = await response.json();
            return students as User[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const hasStudents = (allStudents?.length ?? initialStudentCount) > 0;

    const handleModalClose = () => {
        setCurrentStep('showArrow');
        // Update URL to show arrow
        router.replace(`${pathname}?tutorial=showArrow`);
    };

    const handleArrowDismiss = () => {
        setCurrentStep(undefined);
        // Clean URL completely
        router.replace(pathname);
    };

    return (
        <>
            {currentStep === 'start' && (
                <TutorialModal
                    isModalOpen={true}
                    onClose={handleModalClose}
                    classId={classId}
                    teacherId={teacherId}
                />
            )}
            {currentStep === 'showArrow' && hasStudents && (
                <JotTutorialArrow
                    onDismiss={handleArrowDismiss}
                    classId={classId}
                    teacherId={teacherId}
                />
            )}
        </>
    );
}
