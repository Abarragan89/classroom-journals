import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Rubric } from "@/types"

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
            <p className="text-center text-success my-3">Upgrade to Premium to have AI automatically grade blogs using these rubrics</p>
            <Table className="rounded-lg">
                <TableCaption>Use these rubrics when grading student journals/essays.</TableCaption>
                <TableHeader className="rounded-t-lg">
                    <TableRow>
                        <TableHead className="w-[100px]">My Rubrics</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {teacherRubrics.map((rubric: Rubric) => (
                        <TableRow key={rubric.id}>
                            <TableCell
                                onClick={() => toggleShowMyRubrics(rubric)}
                                className="font-medium line-clamp-1 cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                                {rubric.title}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                    </TableRow>
                </TableFooter>
            </Table>
        </>
    )
}
