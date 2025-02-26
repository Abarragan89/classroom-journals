import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import AddClassForm from "./add-class-form"


export default function AddClassModal() {

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Plus /> Add Class
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Class</DialogTitle>
                    <DialogDescription>Fill out the form below to create a new class.</DialogDescription>
                </DialogHeader>
                <AddClassForm />
            </DialogContent>
        </Dialog>
    )
}
