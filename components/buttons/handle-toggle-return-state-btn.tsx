'use client'
import { toggleReturnStateStatus } from '@/lib/actions/response.action'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import { useState } from 'react'
import { ResponseStatus } from '@prisma/client'

export default function HandleToggleReturnStateBtn({
  isCompleted,
  responseId,
}: {
  isCompleted: boolean,
  responseId: string
}) {

  const [isSubmittable, setIsSubmittaisSubmittable] = useState<boolean>(!isCompleted)


  async function handleToggleReturnState(newState: ResponseStatus) {
    try {
      const response = await toggleReturnStateStatus(responseId, newState)
      if (response.success) {
        setIsSubmittaisSubmittable(newState === 'RETURNED' ? true : false)
        toast('Assignment Returned')
        return;
      } else {
        throw new Error('error toggling return status')
      }
    } catch (error) {
      console.log('error toggling return state ', error)
    }
  }

  return (
    <div>
      {isSubmittable ? (
        <Button
          onClick={() => handleToggleReturnState('COMPLETE')}
        >
          Collect
        </Button>
      ) : (

        <Button
          onClick={() => handleToggleReturnState('RETURNED')}
        >
          Return
        </Button>
      )}
    </div>
  )
}
