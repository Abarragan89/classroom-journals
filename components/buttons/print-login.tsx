'use client';

export default function PringLoginBtn() {
    return (
        <p 
        onClick={() => window.print()}
        className="z-10 underline font-bold mt-4 hover:cursor-pointer hover:italic w-fit"
        >Print logins
        </p>
    )
}
