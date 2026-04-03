import { useCallback, useEffect, useState } from "react"
import { reaction } from "mobx"
import type {
  InfiniteQueryMethod,
  InfiniteQueryResult,
  UseInfiniteQueryOptions,
} from "../types/query"

/**
 * React hook that subscribes to a MobX-powered infinite query.
 *
 * - Loads the first page on mount (unless `enabled` is false).
 * - Subscribes to observable state and re-renders on changes.
 * - Provides `fetchNextPage` to load subsequent pages.
 *
 * @param query   - An InfiniteQueryMethod from `store.queries.*`
 * @param options - Optional configuration
 */
export function useInfiniteQuery<TData, TPageParam>(
  query: InfiniteQueryMethod<TData, TPageParam>,
  options?: UseInfiniteQueryOptions,
): InfiniteQueryResult<TData, TPageParam> {
  const enabled = options?.enabled ?? true

  const [, setVersion] = useState(0)

  useEffect(() => {
    if (enabled) {
      query().catch(() => {})
    }
  }, [query, enabled])

  useEffect(() => {
    const disposer = reaction(
      () => {
        const s = query.getState()
        return {
          pagesLen: s.pages.length,
          error: s.error,
          status: s.status,
          fetchedAt: s.fetchedAt,
          hasNextPage: s.hasNextPage,
          isFetchingNextPage: s.isFetchingNextPage,
        }
      },
      () => {
        setVersion((v) => v + 1)
      },
      { fireImmediately: true },
    )
    return () => disposer()
  }, [query])

  const state = query.getState()

  const fetchNextPage = useCallback(
    () => query.fetchNextPage(),
    [query],
  )

  const refetch = useCallback(
    () => query.refetch(),
    [query],
  )

  const hasPages = state.pages.length > 0

  return {
    data: hasPages
      ? { pages: [...state.pages], pageParams: [...state.pageParams] }
      : undefined,
    error: state.error,
    isPending: state.isPending,
    isError: state.isError,
    isSuccess: state.isSuccess,
    hasNextPage: state.hasNextPage,
    isFetchingNextPage: state.isFetchingNextPage,
    fetchNextPage,
    refetch,
  }
}
