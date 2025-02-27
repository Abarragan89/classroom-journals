
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import AddClassForm from "../add-class-form/add-class-form"


export default function EditClassModal(
    { teacherId, open }
        : { teacherId: string, open: boolean }) {


    return (
        <Dialog>
            <DialogContent className="max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Class</DialogTitle>
                    <DialogDescription>Fill out the form below to create a new class.</DialogDescription>
                </DialogHeader>
                <AddClassForm teacherId={teacherId} />
            </DialogContent>
        </Dialog>
    )
}
