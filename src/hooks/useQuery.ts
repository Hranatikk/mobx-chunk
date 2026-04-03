import { useCallback, useEffect, useRef, useState } from "react"
import { reaction } from "mobx"
import type {
  QueryMethod,
  QueryResult,
  UseQueryOptions,
} from "../types/query"

/**
 * React hook that subscribes to a MobX-powered query.
 *
 * - Automatically triggers the query on mount (unless `enabled` is false).
 * - Subscribes to the observable query state and re-renders on changes.
 * - Returns cached data when available, or fetches fresh data.
 *
 * @param query - A QueryMethod from `store.queries.*`
 * @param args  - Arguments to pass to the query, optionally followed by UseQueryOptions
 */
export function useQuery<TData, TArgs extends any[]>(
  query: QueryMethod<TData, TArgs>,
  ...rest: [...TArgs] | [...TArgs, UseQueryOptions]
): QueryResult<TData> {
  const lastArg = rest[rest.length - 1]
  const hasOptions =
    lastArg != null &&
    typeof lastArg === "object" &&
    !Array.isArray(lastArg) &&
    "enabled" in lastArg

  const options: UseQueryOptions = hasOptions
    ? (rest[rest.length - 1] as UseQueryOptions)
    : {}
  const args = (hasOptions ? rest.slice(0, -1) : rest) as unknown as TArgs

  const enabled = options.enabled ?? true
  const argsRef = useRef(args)
  argsRef.current = args

  const [, setVersion] = useState(0)

  useEffect(() => {
    if (enabled) {
      query(...argsRef.current).catch(() => {})
    }
  }, [query, enabled, JSON.stringify(args)])

  useEffect(() => {
    const disposer = reaction(
      () => {
        const s = query.getState(...argsRef.current)
        return {
          data: s.data,
          error: s.error,
          status: s.status,
          fetchedAt: s.fetchedAt,
        }
      },
      () => {
        setVersion((v) => v + 1)
      },
      { fireImmediately: true },
    )
    return () => disposer()
  }, [query, JSON.stringify(args)])

  const state = query.getState(...argsRef.current)

  const refetch = useCallback(
    () => query.refetch(...argsRef.current),
    [query],
  )

  return {
    data: state.data,
    error: state.error,
    isPending: state.isPending,
    isError: state.isError,
    isSuccess: state.isSuccess,
    refetch,
  }
}
