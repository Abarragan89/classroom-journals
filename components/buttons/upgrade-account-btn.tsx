import Link from 'next/link'

export default function UpgradeAccountBtn() {
    return (
            <p className="w-fit text-sm font-bold text-success">
                Autograde Assessments with AI!
                <Link className='ml-1 text-primary underline hover:italic' href={'/teacher-account#subscription-section'}>
                    Upgrade Now
                </Link>
            </p>
    )
}
