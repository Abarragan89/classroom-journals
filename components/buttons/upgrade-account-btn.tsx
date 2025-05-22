'use client'
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { determineSubscriptionAllowance } from '@/lib/actions/profile.action';

export default function UpgradeAccountBtn({
    teacherId
}: {
    teacherId: string
}) {
    const { isPending, error, data } = useQuery({
        queryKey: ['teacher-sub-status', teacherId],
        queryFn: () => determineSubscriptionAllowance(teacherId),
        refetchOnReconnect: false,
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
