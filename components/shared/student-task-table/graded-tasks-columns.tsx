"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Response } from "@/types"
import Link from "next/link"

export const gradedTasksColumns: ColumnDef<Response>[] = [
    {
        accessorKey: "submittedAt",
        header: "Submitted",
        cell: ({ row }) => {
            return <div className="min-w-[85px]">{row.getValue('submittedAt')}</div>
        }
    },
    {
        accessorKey: "score",
        header: "Grade",
        cell: ({ row }) => {
            if (row.original.promptSession?.areGradesVisible) {
                const scoreInt = parseInt(row.getValue('score'))
                return (
                    <div className={`${scoreInt >= 80 ? 'text-success' : scoreInt >= 70 ? 'text-warning' : 'text-destructive'} font-bold`}
                    >
                        {row.getValue('score')}
                    </div>)
            } else {
                return (
                    <div className="text-ring font-bold">
                        {'N/A'}
                    </div>)
            }
        }
    },
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
            return (
                <Link
                    href={`/response-review/${row.original.id}`}
                    className="line-clamp-1 hover:cursor-pointer hover:underline"
                >
                    {row.original?.promptSession?.title}
                </Link>
            )
        }
    },
]
