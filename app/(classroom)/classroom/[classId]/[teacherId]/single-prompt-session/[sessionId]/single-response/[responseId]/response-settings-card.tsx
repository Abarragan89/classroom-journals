'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { Response } from '@/types'
import { toggleSpellCheck, toggleVoiceToText } from '@/lib/actions/response.action'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import HandleToggleReturnStateBtn from '@/components/buttons/handle-toggle-return-state-btn'
import DeleteResponseBtn from './delete-response-btn'

export default function ResponseSettingsCard({
    initialResponse,
    responseId,
    sessionId,
    teacherId,
    classId,
}: {
    initialResponse: Response
    responseId: string
    sessionId: string
    teacherId: string
    classId: string
}) {
    const { data: response } = useQuery({
        queryKey: ['response', responseId],
        queryFn: async () => initialResponse,
        initialData: initialResponse,
        staleTime: Infinity,
    })

    const [isSpellCheckEnabled, setIsSpellCheckEnabled] = useState(initialResponse.spellCheckEnabled)
    const [isVoiceToTextEnabled, setIsVoiceToTextEnabled] = useState(initialResponse.isVoiceToTextEnabled as boolean)
    const [spellCheckPending, setSpellCheckPending] = useState(false)
    const [voicePending, setVoicePending] = useState(false)

    const isNotSubmitted = response?.completionStatus !== 'COMPLETE'

    async function handleSpellCheckToggle(checked: boolean) {
        setSpellCheckPending(true)
        try {
            const result = await toggleSpellCheck(responseId, checked, teacherId)
            if (result.success) {
                setIsSpellCheckEnabled(checked)
                toast(checked ? 'Spell check enabled' : 'Spell check disabled')
            } else {
                toast.error('Failed to update spell check')
            }
        } catch {
            toast.error('Failed to update spell check')
        } finally {
            setSpellCheckPending(false)
        }
    }

    async function handleVoiceToTextToggle(checked: boolean) {
        setVoicePending(true)
        try {
            const result = await toggleVoiceToText(responseId, checked, teacherId)
            if (result.success) {
                setIsVoiceToTextEnabled(checked)
                toast(checked ? 'Voice to text enabled' : 'Voice to text disabled')
            } else {
                toast.error('Failed to update voice to text')
            }
        } catch {
            toast.error('Failed to update voice to text')
        } finally {
            setVoicePending(false)
        }
    }

    return (
        <Card className="my-6 shadow-sm border border-muted">
            <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Response Settings</CardTitle>
                {isNotSubmitted && (
                    <Badge variant="destructive">Not Submitted</Badge>
                )}
            </CardHeader>

            <CardContent className="space-y-5 p-4 pt-2 rounded-md">
                {/* Spell Check */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="spell-check-toggle" className="text-sm font-medium leading-none">
                            Spell Check
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Student can use spell check while typing
                        </p>
                    </div>
                    <Switch
                        id="spell-check-toggle"
                        checked={isSpellCheckEnabled}
                        onCheckedChange={handleSpellCheckToggle}
                        disabled={spellCheckPending}
                        aria-label="Toggle spell check"
                    />
                </div>

                {/* Voice to Text */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="voice-toggle" className="text-sm font-medium leading-none">
                            Voice to Text
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Student can dictate their response
                        </p>
                    </div>
                    <Switch
                        id="voice-toggle"
                        checked={isVoiceToTextEnabled}
                        onCheckedChange={handleVoiceToTextToggle}
                        disabled={voicePending}
                        aria-label="Toggle voice to text"
                    />
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <HandleToggleReturnStateBtn
                        responseId={responseId}
                        teacherId={teacherId}
                        isCompleted={response?.completionStatus === 'COMPLETE'}
                        sessionId={sessionId}
                    />
                    <DeleteResponseBtn
                        responseId={responseId}
                        sessionId={sessionId}
                        teacherId={teacherId}
                        classId={classId}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
