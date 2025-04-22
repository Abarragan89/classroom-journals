'use client'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDateMonthDayYear } from "@/lib/utils"
import { useState } from "react"
import { User } from "@/types"
import Link from "next/link"
import { deleteTeacherAccount, updateUsername } from "@/lib/actions/profile.action"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { ResponsiveDialog } from "./responsive-dialog"
import { signOutUser } from "@/lib/actions/auth.action"

export default function UserSettings({
    teacherData,
}: {
    teacherData: User,
}) {

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [userConfirmationText, setUserConfirmationText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [updatedUsername, setUpdatedUsername] = useState<string>(teacherData?.username as string)
    const today = new Date();
    const isSubscriptionValid = teacherData?.subscriptionExpires ? teacherData?.subscriptionExpires > today : false;
    const isCancelling = teacherData.isCancelling;
    const accountStatus = isSubscriptionValid ? teacherData?.accountType : 'Basic-Free'

    async function updateUsernameHandler() {
        try {
            await updateUsername(updatedUsername, teacherData?.id);
            toast('Username updated!')
        } catch (error) {
            console.log('error updating username ', error)
        }
    }

    async function handleDeleteAccount() {
        try {
            setIsLoading(true)
            const isDeleted = await deleteTeacherAccount(teacherData?.id)
            if (isDeleted.success) {
                setIsModalOpen(false)
                setIsLoading(false)
                signOutUser()
            }
        } catch (error) {
            console.log('error deleting account', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <ResponsiveDialog
                title="Confirm Delete Account"
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
            >
                <p>Are you sure you want to delete your account?</p>
                <p>Type &lsquo;confirm delete&lsquo; to confirm</p>
                <Input
                    type="text"
                    onChange={(e) => setUserConfirmationText(e.target.value)}
                />
                <Button
                    disabled={userConfirmationText !== 'confirm delete' || isLoading}
                    variant='destructive'
                    onClick={handleDeleteAccount}
                >
                    {isLoading ? 'Deleting...' : 'Delete Account'}
                </Button>
            </ResponsiveDialog>
            <section className="mt-8">
                <h3 className="text-lg mb-1">Account Information</h3>
                <div className="md:flex-between space-y-5 md:space-y-0">
                    <div className="w-full md:mr-3 min-w-[275px]">
                        <Label>Username</Label>
                        <Input
                            defaultValue={teacherData?.username}
                            onBlur={updateUsernameHandler}
                            onChange={(e) => setUpdatedUsername(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:ml-3 min-w-[275px]">
                        <Label>Name</Label>
                        <Input
                            defaultValue={teacherData?.name}
                            readOnly
                            disabled
                        />
                    </div>
                </div>
                <div className="md:flex-between mt-5 space-y-5 md:space-y-0">
                    <div className="w-full md:mr-3 min-w-[275px]">
                        <Label>Email</Label>
                        <Input
                            defaultValue={teacherData?.email}
                            readOnly
                            disabled
                        />
                    </div>
                    <div className="w-full md:ml-3 min-w-[275px] relative">
                        <Label>Account Type</Label>
                        <Input
                            defaultValue={accountStatus}
                            readOnly
                            disabled
                        />
                        {/* Don't show this if it is already expired and to Basic-Free */}
                        {isCancelling && accountStatus !== 'Basic-Free' &&
                            <p
                                className="text-xs text-destructive absolute top-1 right-2"
                            >Expires: {formatDateMonthDayYear(teacherData?.subscriptionExpires)}</p>
                        }
                    </div>
                </div>
                <div className="flex-between mt-8">
                    {accountStatus !== 'Basic-Free' &&
                        <Link
                            className="inline-block underline hover:italic w-fit"
                            href='https://billing.stripe.com/p/login/7sIdRq4Y21h7enSbII'
                        >
                            Payment Settings
                        </Link>
                    }
                    <div className="flex flex-col items-center space-y-1">
                        <Button disabled={isCancelling === false} variant='destructive' onClick={() => setIsModalOpen(true)} >
                            Delete Account
                        </Button>
                        {!isCancelling && isSubscriptionValid && (
                            <p className="text-xs text-input">You must first unsubscribe to delete account</p>
                        )}
                    </div>
                </div>
            </section>
        </>
    )
}
