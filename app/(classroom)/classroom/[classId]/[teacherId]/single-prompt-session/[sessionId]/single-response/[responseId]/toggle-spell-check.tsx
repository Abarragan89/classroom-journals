'use client';
import { Switch } from "@/components/ui/switch";
import { toggleSpellCheck } from "@/lib/actions/response.action";
import { useState } from "react";

export default function ToggleSpellCheck({
    spellCheckEnabled,
    responseId
}: {
    spellCheckEnabled: boolean,
    responseId: string
}) {

    const [isSpellCheckEnabled, setIsSpellCheckEnabled] = useState<boolean>(spellCheckEnabled)

    async function toggleSpellCheckHandler(isSpellCheckEnabled: boolean) {
        try {
            const response = await toggleSpellCheck(responseId, isSpellCheckEnabled)
            if (response.success) {
                setIsSpellCheckEnabled(isSpellCheckEnabled)
            }
        } catch (error) {
            console.log('error toggling grade visibility', error)
        }
    }

    return (
        <div className='flex-start items-center justify-center space-x-2'>
            <p className="text-sm text-center">Spell Check</p>
            <Switch
                className="text-sm mx-2"
                onCheckedChange={(e) => toggleSpellCheckHandler(e)}
                checked={isSpellCheckEnabled}
            />
        </div>
    )
}
