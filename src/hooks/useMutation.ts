import { useCallback, useEffect, useState } from "react"
import { reaction } from "mobx"
import type {
  MutationMethod,
  MutationResult,
} from "../types/query"

/**
 * React hook that subscribes to a MobX-powered mutation.
 *
 * - Provides `mutate` (fire-and-forget) and `mutateAsync` (returns Promise).
 * - Subscribes to observable mutation state and re-renders on changes.
 *
 * @param mutation - A MutationMethod from `store.queries.*`
 */
export function useMutation<TData, TArgs extends any[]>(
  mutation: MutationMethod<TData, TArgs>,
): MutationResult<TData, TArgs> {
  const [, setVersion] = useState(0)

  useEffect(() => {
    const disposer = reaction(
      () => ({
        data: mutation.state.data,
        error: mutation.state.error,
        status: mutation.state.status,
      }),
      () => {
        setVersion((v) => v + 1)
      },
      { fireImmediately: true },
    )
    return () => disposer()
  }, [mutation])

  const mutateAsync = useCallback(
    (...args: TArgs) => mutation(...args),
    [mutation],
  )

  const mutate = useCallback(
    (...args: TArgs) => {
      mutation(...args).catch(() => {})
    },
    [mutation],
  )

  const reset = useCallback(() => mutation.reset(), [mutation])

  const { state } = mutation

  return {
    mutate,
    mutateAsync,
    data: state.data,
    error: state.error,
    isPending: state.isPending,
    isError: state.isError,
    isSuccess: state.isSuccess,
    reset,
  }
}
