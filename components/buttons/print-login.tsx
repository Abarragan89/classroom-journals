'use client';
import { Button } from "../ui/button";

export default function PringLoginBtn() {
    return (
        <Button
            variant={"secondary"}
            onClick={() => window.print()}
        >
            Print logins
        </Button>
    )
}
