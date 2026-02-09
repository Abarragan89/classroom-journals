'use client';
import { Button } from "../ui/button";

export default function PringLoginBtn() {
    return (
        <Button
        className="shadow-sm"
            variant={"secondary"}
            onClick={() => window.print()}
        >
            Print Logins
        </Button>
    )
}
