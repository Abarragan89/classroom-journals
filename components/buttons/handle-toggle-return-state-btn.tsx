'use client'
import { toggleReturnStateStatus } from '@/lib/actions/response.action'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import { useState } from 'react'
import { ResponseStatus } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Response as QuipResponse, PromptSession } from '@/types'

export default function HandleToggleReturnStateBtn({
  isCompleted,
  responseId,
  teacherId,
  sessionId
}: {
  isCompleted: boolean,
  responseId: string,
  teacherId: string,
  sessionId?: string
}) {

  const [isSubmittable, setIsSubmittaisSubmittable] = useState<boolean>(!isCompleted)
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: async (newState: ResponseStatus) => {
      return await toggleReturnStateStatus(responseId, newState, teacherId);
    },
    onMutate: async (newState) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['response', responseId] });
      if (sessionId) {
        await queryClient.cancelQueries({ queryKey: ['getSingleSessionData', sessionId] });
      }

      // Snapshot previous values
      const previousResponse = queryClient.getQueryData<QuipResponse>(['response', responseId]);
      const previousSession = sessionId ? queryClient.getQueryData<PromptSession>(['getSingleSessionData', sessionId]) : undefined;

      // Optimistically update local state
      const newIsSubmittable = newState === 'RETURNED';
      setIsSubmittaisSubmittable(newIsSubmittable);

      // Update individual response cache
      queryClient.setQueryData<QuipResponse>(['response', responseId], (old) => {
        if (!old) return old;
        return {
          ...old,
          completionStatus: newState
        };
      });

      // Update session cache (contains all responses)
      if (sessionId) {
        queryClient.setQueryData<PromptSession>(['getSingleSessionData', sessionId], (old) => {
          if (!old) return old;
          return {
            ...old,
            responses: old.responses?.map(response =>
              response.id === responseId
                ? { ...response, completionStatus: newState }
                : response
            )
          };
        });
      }

      return { previousResponse, previousSession, previousIsSubmittable: !newIsSubmittable };
    },
    onError: (err, _variables, context) => {
      console.error('Error toggling return state:', err);

      // Rollback both caches
      if (context?.previousResponse) {
        queryClient.setQueryData(['response', responseId], context.previousResponse);
      }
      if (context?.previousSession && sessionId) {
        queryClient.setQueryData(['getSingleSessionData', sessionId], context.previousSession);
      }
      if (context?.previousIsSubmittable !== undefined) {
        setIsSubmittaisSubmittable(context.previousIsSubmittable);
      }

      toast.error('Failed to update assignment status');
    },
    onSuccess: (data, newState) => {
      if (data?.success) {
        toast.success(newState === 'RETURNED' ? 'Assignment Returned' : 'Assignment Collected');
      } else {
        toast.error('Failed to update assignment status');
      }
    }
  });

  function handleToggleReturnState(newState: ResponseStatus) {
    toggleMutation.mutate(newState);
  }

  return (
    <div className='relative'>
      {isSubmittable ? (
        <Button
          variant={"secondary"}
          size={"sm"}
          onClick={() => handleToggleReturnState('COMPLETE')}
          disabled={toggleMutation.isPending}
        >
          {toggleMutation.isPending ? 'Returning...' : 'Collect'}
        </Button>
      ) : (
        <Button
          variant={"secondary"}
          size={"sm"}
          onClick={() => handleToggleReturnState('RETURNED')}
          disabled={toggleMutation.isPending}
        >
          {toggleMutation.isPending ? 'Collecting...' : 'Return'}
        </Button>
      )}
    </div>
  )
}
