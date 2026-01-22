'use client'
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

export default function UpgradeAccountBtn({
    teacherId
}: {
    teacherId: string
}) {
    const { isPending, error, data } = useQuery({
        queryKey: ['teacher-sub-status', teacherId],
        queryFn: async () => {
            const response = await fetch(`/api/profile/subscription-allowance?teacherId=${teacherId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch subscription allowance');
            }
            const { subscriptionData } = await response.json();
            return subscriptionData;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes - subscription status rarely changes
    })

    if (isPending) return
    if (error) {
        throw new Error('Cannot determine subscription status')
    }

    return (
        <>
            {data && !data.isPremiumTeacher && (
                <p className="w-fit text-sm font-bold text-success">
                    Autograde Assessments with AI!
                    <Link
                        className='ml-1 text-primary underline hover:italic'
                        href={'/teacher-account#subscription-section'}
                    >
                        Upgrade Now
                    </Link>
                </p>

            )}
        </>
    )
}
