'use client';
import { Switch } from "@/components/ui/switch";
import { toggleSpellCheck } from "@/lib/actions/response.action";
import { useState } from "react";
import { toast } from "sonner";

export default function ToggleSpellCheck({
    spellCheckEnabled,
    responseId,
    teacherId
}: {
    spellCheckEnabled: boolean,
    responseId: string,
    teacherId: string
}) {

    const [isSpellCheckEnabled, setIsSpellCheckEnabled] = useState<boolean>(spellCheckEnabled)

    async function toggleSpellCheckHandler(isSpellCheckEnabled: boolean) {
        try {
            const response = await toggleSpellCheck(responseId, isSpellCheckEnabled, teacherId)
            if (response.success) {
                setIsSpellCheckEnabled(isSpellCheckEnabled)
                const toastString = isSpellCheckEnabled ? 'Spell Check is Enabled' : 'Spell Check is Disabled'
                toast(toastString)
            }
        } catch (error) {
            console.log('error toggling grade visibility', error)
        }
    }

    return (
        <div className='flex-start items-center justify-center space-x-2'>
            <p className="text-center">Spell Check</p>
            <Switch
                className="text-sm mx-2"
                onCheckedChange={(e) => toggleSpellCheckHandler(e)}
                checked={isSpellCheckEnabled}
            />
        </div>
    )
}
