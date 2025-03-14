import { PromptSession } from '@/types'
import { formatDateShort } from '@/lib/utils'

export default function JotListBanner({ jotData }: { jotData: PromptSession }) {
    return (
        <article className='bg-card opacity-80 text-card-foreground px-5 py-2 rounded-lg mt-3 mb-4 border border-border hover:cursor-pointer hover:opacity-100'>
            <div className="flex-between text-xs">
                <p>Status: {jotData.status}</p>
                <p>{formatDateShort(jotData.createdAt)}</p>
            </div>
            <p className='text-md py-3 font-bold'>{jotData.title}</p>
            <div className="flex-between text-xs">
                <p>Submissions: 3/12</p>
                <p>Questions: 3</p>
            </div>
        </article>
    )
}
