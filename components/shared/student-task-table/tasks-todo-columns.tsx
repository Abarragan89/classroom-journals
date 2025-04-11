"use client"
import { ColumnDef } from "@tanstack/react-table"
import { PromptSession } from "@/types"
import Link from "next/link"

export const tasksTodoColumns: ColumnDef<PromptSession>[] = [
    {
        accessorKey: "createdAt",
        header: "Assigned",
        cell: ({ row }) => {
            return <div className="min-w-[85px]">{row.getValue('createdAt')}</div>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({row}) => (
            <div className={`${row.original.status === 'Incomplete' ? 'text-destructive' : 'text-warning'} font-bold`}>{row.getValue('status')}</div>
        )
    },
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
            if (row.original.status === 'Incomplete') {
                return <Link
                    href={`jot-response/${row.original.id}?q=0`}
                    className="line-clamp-1 hover:cursor-pointer hover:underline">
                    {row.getValue('title')}
                </Link>
            } else {
                return <Link
                    href={`response-review/${row.original.id}`}
                    className="line-clamp-1 hover:cursor-pointer hover:underline">
                    {row.getValue('title')}
                </Link>

            }

        }
    },
]
