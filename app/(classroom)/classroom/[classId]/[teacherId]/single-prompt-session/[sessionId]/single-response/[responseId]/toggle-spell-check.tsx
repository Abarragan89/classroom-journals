'use client';
import { Switch } from "@/components/ui/switch";
import { toggleSpellCheck, toggleVoiceToText } from "@/lib/actions/response.action";
import { useState } from "react";
import { toast } from "sonner";

export default function ToggleSpellCheckAndVoiceToText({
    spellCheckEnabled,
    voiceToTextEnabled,
    responseId,
    teacherId
}: {
    spellCheckEnabled: boolean,
    voiceToTextEnabled: boolean,
    responseId: string,
    teacherId: string
}) {

    const [isSpellCheckEnabled, setIsSpellCheckEnabled] = useState<boolean>(spellCheckEnabled)
    const [isVoiceToTextEnabled, setIsVoiceToTextEnabled] = useState<boolean>(voiceToTextEnabled)

    async function toggleSpellCheckHandler(isSpellCheckEnabled: boolean) {
        try {
            const response = await toggleSpellCheck(responseId, isSpellCheckEnabled, teacherId)
            if (response.success) {
                setIsSpellCheckEnabled(isSpellCheckEnabled)
                const toastString = isSpellCheckEnabled ? 'Spell Check is Enabled' : 'Spell Check is Disabled'
                toast(toastString)
            }
        } catch (error) {
            console.error('error toggling spell check', error)
        }
    }

    async function toggleVoiceToTextHandler(isVoiceToTextEnabled: boolean) {
        try {
            const response = await toggleVoiceToText(responseId, isVoiceToTextEnabled, teacherId)
            if (response.success) {
                setIsVoiceToTextEnabled(isVoiceToTextEnabled)
                const toastString = isVoiceToTextEnabled ? 'Voice To Text is Enabled' : 'Voice To Text is Disabled'
                toast(toastString)
            }
        } catch (error) {
            console.error('error toggling voice to text', error)
        }
    }

    return (
        <div className="flex-center gap-x-5">
            <div className='flex-start items-center justify-center space-x-2'>
                <p className="text-center font-bold text-sm text-muted-foreground">Spell Check</p>
                <Switch
                    className="text-sm mx-2"
                    onCheckedChange={(e) => toggleSpellCheckHandler(e)}
                    checked={isSpellCheckEnabled}
                />
            </div>
            <div className='flex-start items-center justify-center space-x-2'>
                <p className="text-center font-bold text-sm text-muted-foreground">Voice To Text</p>
                <Switch
                    className="text-sm mx-2"
                    onCheckedChange={(e) => toggleVoiceToTextHandler(e)}
                    checked={isVoiceToTextEnabled}
                />
            </div>
        </div>
    )
}
