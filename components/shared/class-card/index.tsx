import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Class } from "@/types";
import OptionsMenu from "./options-menu";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function ClassCard({ classData, teacherId }: { classData: Class, teacherId: string }) {
    return (

        <Card className="min-w-[350px] relative hover:border-primary">

            {/* Absolutely positions options menu with responsive dialogs */}
            <OptionsMenu teacherId={teacherId} classData={classData} />
            <Link
                href={`/classroom/${classData.id}`}
                className="hover:cursor-pointer"
            >
                <CardHeader className="flex flex-row justify-between">
                    <div>
                        <CardTitle>{classData.name}</CardTitle>
                        <CardDescription>{classData.year}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>

                    <p>&nbsp;</p>
                </CardContent>
                <Separator />
                <CardFooter className="flex justify-between text-sm mt-2">
                    <p>Students: 24</p>
                    <p>created: 2/12/19</p>
                </CardFooter>
            </Link>
        </Card>
    )
}
