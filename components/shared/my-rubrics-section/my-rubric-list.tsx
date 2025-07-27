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
    teacherRubrics
}: {
    teacherRubrics: Rubric[]
}) {

    return (
        <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Name</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {teacherRubrics.map((rubric) => (
                    <TableRow key={rubric.id}>
                        <TableCell className="font-medium">{rubric.title}</TableCell>
                        {/* <TableCell>{rubric.paymentStatus}</TableCell>
                        <TableCell>{rubric.paymentMethod}</TableCell>
                        <TableCell className="text-right">{rubric.totalAmount}</TableCell> */}
                    </TableRow>
                ))}
            </TableBody>
            {/* <TableFooter>
                <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">$2,500.00</TableCell>
                </TableRow>
            </TableFooter> */}
        </Table>
    )
}
