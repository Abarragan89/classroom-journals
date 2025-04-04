'use client'
import { toggleReturnStateStatus } from '@/lib/actions/response.action'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import { useState } from 'react'

export default function HandleToggleReturnStateBtn({
  initialSubmitStatus,
  responseId,
}: {
  initialSubmitStatus: boolean,
  responseId: string
}) {

  const [isSubmittable, setIsSubmittaisSubmittable] = useState<boolean>(initialSubmitStatus)


  async function handleToggleReturnState(newState: boolean) {
    try {
      const response = await toggleReturnStateStatus(responseId, newState)
      if (response.success) {
        setIsSubmittaisSubmittable(newState)
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
          onClick={() => handleToggleReturnState(false)}
        >
          Collect Assignment
        </Button>
      ) : (

        <Button
          onClick={() => handleToggleReturnState(true)}
        >
          Return to Student
        </Button>
      )}
    </div>
  )
}
