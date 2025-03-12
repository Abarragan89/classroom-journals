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
        <Card className="w-[350px] relative hover:shadow-[0_4px_10px_-3px_var(--secondary)] active:shadow-none">
            {/* Absolutely positions options menu with responsive dialogs */}
            <OptionsMenu classData={classData} />
            <Link
                href={`/classroom/${classData.id}/${teacherId}`}
                className="hover:cursor-pointer"
            >
                <CardHeader className="flex flex-row justify-between">
                    <div className="w-[95%]"> 
                        <CardTitle className="line-clamp-1">{classData.name}</CardTitle>
                        <CardDescription>{classData.year}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex-between">
                    {classData.subject ? (
                        <p>{classData.subject}</p>
                    ) : (
                        <p>&nbsp;</p>
                    )}
                </CardContent>
                <Separator />
                <CardFooter className="flex justify-between text-sm mt-2 pb-3">
                    {classData.period ? (<p>Period: {classData.period}</p>) : (<p>&nbsp;</p>)}
                    <p>Class Code: <span className="bg-accent  text-accent-foreground px-2 py-1 rounded-full tracking-wider">{classData.classCode}</span></p>
                </CardFooter>
            </Link>
        </Card>
    )
}
