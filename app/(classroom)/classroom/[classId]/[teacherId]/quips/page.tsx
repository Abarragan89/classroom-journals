import QuipsClientWraper from "./quips-client-wrapper";


export default function Quips() {
    return (
        <>
            <div className="relative">
                <h2 className="text-2xl lg:text-3xl mt-2">Posted Quips</h2>
                <QuipsClientWraper />
            </div>
        </>
    )
}
