import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Rubric } from "@/types"
import { ChevronRight, Table2Icon } from "lucide-react"

export default function MyRubricList({
    teacherRubrics,
    toggleShowMyRubrics
}: {
    teacherRubrics: Rubric[],
    toggleShowMyRubrics: (rubricData: Rubric) => void
}) {

    if (teacherRubrics.length === 0) {
        return (
            <p className="text-center text-muted-foreground my-3">
                You have no rubrics yet. Create one to get started!
            </p>
        )
    }

    return (
        <>
            <div className="border rounded-md shadow-md hover:shadow-lg transition-shadow mt-8">
                <Table>
                    <TableHeader className="border-b-2 border-primary/20">
                        <TableRow>
                            <TableHead className="h3-bold flex items-center gap-2 py-4">
                                <Table2Icon size={20} className="text-primary" />
                                Rubric List
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teacherRubrics.map((rubric: Rubric) => (
                            <TableRow
                                key={rubric.id}
                                className="group"
                            >
                                <TableCell
                                    onClick={() => toggleShowMyRubrics(rubric)}
                                    className="flex items-center gap-3 font-semibold text-base cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all py-4 px-4"
                                >
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                                        <Table2Icon size={18} />
                                    </span>
                                    <span className="flex-1">{rubric.title}</span>
                                    {/* Optional metadata */}
                                    <span className="text-xs text-muted-foreground hidden group-hover:inline">
                                        View
                                    </span>
                                    <span className="opacity-50 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight size={18} />
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    )
}
