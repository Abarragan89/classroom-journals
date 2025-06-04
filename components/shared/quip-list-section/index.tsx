"use client"
import { PromptSession } from "@/types"
import QuipListItem from "./quip-list-item"
import { ClassUserRole } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { getAllQuips } from "@/lib/actions/quips.action";
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import CreateQuipForm from "@/components/forms/quip-forms/create-quip"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import { useState } from "react";
import { Accordion } from "@/components/ui/accordion";


export default function QuipListSection({
    userId,
    role,
    classId,
    allQuips
}: {
    userId: string
    role: ClassUserRole;
    classId: string;
    allQuips: PromptSession[]
}) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    // Get the prompt sessions
    const { data: currentQuips = [] } = useQuery({
        queryKey: ['getAllQuips', classId],
        queryFn: async () => {
            return await getAllQuips(classId, userId) as unknown as PromptSession[];
        },
        initialData: allQuips,
        refetchOnReconnect: false,
        // refetchOnWindowFocus: false,
        // refetchOnMount: false,
        // staleTime: Infinity,
    });

    function closeModal() {
        setIsModalOpen(false)
    }

    return (
        <section>
            {role === "TEACHER" && (
                <>
                    <ResponsiveDialog
                        isOpen={isModalOpen}
                        setIsOpen={setIsModalOpen}
                        title="Create Quip"
                    >
                        <CreateQuipForm
                            classId={classId}
                            teacherId={userId}
                            closeModal={closeModal}
                        />
                    </ResponsiveDialog>
                    <div className="flex-end my-4">
                        <Button onClick={() => setIsModalOpen(true)} className="">
                            <Plus /> New Quip
                        </Button>
                    </div>
                </>

            )}
            <Accordion className='mx-5 mt-10' type="single" collapsible>
                {currentQuips && currentQuips?.length > 0 && currentQuips.map((singleQuip, index) => (
                    <QuipListItem
                        singleQuip={singleQuip}
                        key={singleQuip.id}
                        userId={userId}
                        role={role}
                        classId={classId}
                        indexNumber={(index + 1).toString()}
                    />

                ))}
            </Accordion>
        </section>
    )
}
