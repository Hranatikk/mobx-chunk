import { action, computed, makeObservable, observable, runInAction } from "mobx"
import type {
  AnyQueryDefinition,
  InfiniteQueryDefinition,
  InfiniteQueryMethod,
  InfiniteQueryState,
  MutationDefinition,
  MutationMethod,
  QueryDefinition,
  QueryEntryState,
  QueryMethod,
  QueriesRecord,
} from "../types/query"

const DEFAULT_CACHE_TIME = 30_000

function makeCacheKey(args: unknown[]): string {
  return JSON.stringify(args)
}

// ---------------------------------------------------------------------------
// QueryEntryState factory — observable object with computed booleans
// ---------------------------------------------------------------------------

function createEntryState<TData>(): QueryEntryState<TData> {
  const state: QueryEntryState<TData> = {
    data: undefined,
    error: undefined,
    status: "idle" as const,
    get isPending() {
      return state.status === "pending"
    },
    get isError() {
      return state.status === "error"
    },
    get isSuccess() {
      return state.status === "success"
    },
    fetchedAt: null,
  }

  makeObservable(state, {
    data: observable.ref,
    error: observable.ref,
    status: observable,
    isPending: computed,
    isError: computed,
    isSuccess: computed,
    fetchedAt: observable,
  })

  return state
}

// ---------------------------------------------------------------------------
// QueryWrapper — per-args caching, deduplication, invalidation
// ---------------------------------------------------------------------------

function createQueryWrapper<TData, TArgs extends any[]>(
  def: QueryDefinition<TData, TArgs>,
): QueryMethod<TData, TArgs> {
  const cacheTime = def.cacheTime ?? DEFAULT_CACHE_TIME
  const cache = observable.map<string, QueryEntryState<TData>>(
    {},
    { deep: false },
  )
  const inflight = new Map<string, Promise<TData>>()

  function getOrCreateEntry(key: string): QueryEntryState<TData> {
    let entry = cache.get(key)
    if (!entry) {
      entry = createEntryState<TData>()
      cache.set(key, entry)
    }
    return entry
  }

  function isCacheValid(entry: QueryEntryState<TData>): boolean {
    if (entry.status !== "success" || entry.fetchedAt === null) return false
    return Date.now() - entry.fetchedAt < cacheTime
  }

  async function fetchAndUpdate(
    key: string,
    args: TArgs,
  ): Promise<TData> {
    const entry = getOrCreateEntry(key)

    const existing = inflight.get(key)
    if (existing) return existing

    const promise = (async () => {
      runInAction(() => {
        entry.status = "pending"
        entry.error = undefined
      })
      try {
        const data = await def.fn(...args)
        runInAction(() => {
          entry.data = data
          entry.status = "success"
          entry.error = undefined
          entry.fetchedAt = Date.now()
        })
        return data
      } catch (err) {
        runInAction(() => {
          entry.status = "error"
          entry.error = err
        })
        throw err
      } finally {
        inflight.delete(key)
      }
    })()

    inflight.set(key, promise)
    return promise
  }

  const callable = ((...args: TArgs): Promise<TData> => {
    const key = makeCacheKey(args)
    const entry = cache.get(key)
    if (entry && isCacheValid(entry)) {
      return Promise.resolve(entry.data as TData)
    }
    return fetchAndUpdate(key, args)
  }) as QueryMethod<TData, TArgs>

  callable.getState = (...args: TArgs): QueryEntryState<TData> => {
    const key = makeCacheKey(args)
    return getOrCreateEntry(key)
  }

  callable.refetch = (...args: TArgs): Promise<TData> => {
    const key = makeCacheKey(args)
    inflight.delete(key)
    return fetchAndUpdate(key, args)
  }

  callable.invalidate = (...args: TArgs): void => {
    const key = makeCacheKey(args)
    cache.delete(key)
    inflight.delete(key)
  }

  callable.invalidateAll = (): void => {
    cache.clear()
    inflight.clear()
  }

  callable.__dispose = (): void => {
    cache.clear()
    inflight.clear()
  }

  return callable
}

// ---------------------------------------------------------------------------
// InfiniteQueryWrapper — page accumulation, fetchNextPage
// ---------------------------------------------------------------------------

function createInfiniteQueryWrapper<TData, TPageParam>(
  def: InfiniteQueryDefinition<TData, TPageParam>,
): InfiniteQueryMethod<TData, TPageParam> {
  const cacheTime = def.cacheTime ?? DEFAULT_CACHE_TIME
  let inflight: Promise<any> | null = null

  // Internal observable flags that computed getters depend on
  const internal = observable(
    {
      fetchingNext: false,
      nextPageParam: undefined as TPageParam | undefined,
    },
    { fetchingNext: observable, nextPageParam: observable.ref },
  )

  const state = observable(
    {
      pages: [] as TData[],
      pageParams: [] as TPageParam[],
      error: undefined as unknown,
      status: "idle" as "idle" | "pending" | "success" | "error",
      fetchedAt: null as number | null,
      get isPending(): boolean {
        return state.status === "pending" && state.pages.length === 0
      },
      get isFetchingNextPage(): boolean {
        return internal.fetchingNext
      },
      get isError(): boolean {
        return state.status === "error"
      },
      get isSuccess(): boolean {
        return state.status === "success"
      },
      get hasNextPage(): boolean {
        return internal.nextPageParam !== undefined
      },
    },
    {
      pages: observable.shallow,
      pageParams: observable.shallow,
      error: observable.ref,
      status: observable,
      fetchedAt: observable,
      isPending: computed,
      isFetchingNextPage: computed,
      isError: computed,
      isSuccess: computed,
      hasNextPage: computed,
    },
  ) as InfiniteQueryState<TData, TPageParam>

  function isCacheValid(): boolean {
    if (state.status !== "success" || state.fetchedAt === null) return false
    return Date.now() - state.fetchedAt < cacheTime
  }

  function fetchPage(pageParam: TPageParam, isNext: boolean): Promise<TData> {
    runInAction(() => {
      state.status = "pending"
      state.error = undefined
      if (isNext) internal.fetchingNext = true
    })

    return def.fn(pageParam).then(
      (data) => {
        runInAction(() => {
          state.pages.push(data)
          state.pageParams.push(pageParam)
          internal.nextPageParam = def.getNextPageParam(data)
          state.status = "success"
          state.error = undefined
          state.fetchedAt = Date.now()
          internal.fetchingNext = false
        })
        return data
      },
      (err) => {
        runInAction(() => {
          state.status = "error"
          state.error = err
          internal.fetchingNext = false
        })
        throw err
      },
    )
  }

  const callable = ((): Promise<TData> => {
    if (isCacheValid() && state.pages.length > 0) {
      return Promise.resolve(state.pages[0])
    }
    if (inflight) return inflight
    runInAction(() => {
      state.pages.splice(0)
      state.pageParams.splice(0)
    })
    inflight = fetchPage(def.initialPageParam, false).finally(() => {
      inflight = null
    })
    return inflight
  }) as InfiniteQueryMethod<TData, TPageParam>

  callable.getState = (): InfiniteQueryState<TData, TPageParam> => state

  callable.fetchNextPage = async (): Promise<void> => {
    if (internal.nextPageParam === undefined) return
    await fetchPage(internal.nextPageParam, true)
  }

  callable.refetch = async (): Promise<void> => {
    runInAction(() => {
      state.pages.splice(0)
      state.pageParams.splice(0)
      state.fetchedAt = null
      internal.nextPageParam = undefined
    })
    inflight = null
    await fetchPage(def.initialPageParam, false)
  }

  callable.invalidate = (): void => {
    runInAction(() => {
      state.pages.splice(0)
      state.pageParams.splice(0)
      state.fetchedAt = null
      state.status = "idle"
      internal.nextPageParam = undefined
    })
    inflight = null
  }

  callable.__dispose = (): void => {
    callable.invalidate()
  }

  return callable
}

// ---------------------------------------------------------------------------
// MutationWrapper — no cache, single state
// ---------------------------------------------------------------------------

function createMutationWrapper<TData, TArgs extends any[]>(
  def: MutationDefinition<TData, TArgs>,
): MutationMethod<TData, TArgs> {
  const state = createEntryState<TData>()

  const callable = (async (...args: TArgs): Promise<TData> => {
    runInAction(() => {
      state.status = "pending"
      state.error = undefined
    })
    try {
      const data = await def.fn(...args)
      runInAction(() => {
        state.data = data
        state.status = "success"
        state.error = undefined
        state.fetchedAt = Date.now()
      })
      return data
    } catch (err) {
      runInAction(() => {
        state.status = "error"
        state.error = err
      })
      throw err
    }
  }) as MutationMethod<TData, TArgs>

  callable.state = state

  callable.reset = (): void => {
    runInAction(() => {
      state.data = undefined
      state.error = undefined
      state.status = "idle"
      state.fetchedAt = null
    })
  }

  callable.__dispose = (): void => {
    callable.reset()
  }

  return callable
}

// ---------------------------------------------------------------------------
// Public API: createQueries — called from createChunk
// ---------------------------------------------------------------------------

export function createQueries(
  self: any,
  queriesBuilder?: (self: any) => QueriesRecord,
): Record<string, any> | null {
  if (!queriesBuilder) return null

  const definitions = queriesBuilder(self)
  const result: Record<string, any> = {}

  for (const [name, def] of Object.entries(definitions)) {
    switch ((def as AnyQueryDefinition).type) {
      case "query":
        result[name] = createQueryWrapper(def as QueryDefinition)
        break
      case "infiniteQuery":
        result[name] = createInfiniteQueryWrapper(def as InfiniteQueryDefinition)
        break
      case "mutation":
        result[name] = createMutationWrapper(def as MutationDefinition)
        break
      default:
        throw new Error(
          `[mobx-chunk] Unknown query type "${(def as any).type}" for "${name}". ` +
            `Expected "query", "infiniteQuery", or "mutation".`,
        )
    }
  }

  return result
}

/**
 * Dispose all query/mutation wrappers in the queries object.
 */
export function disposeQueries(queries: Record<string, any> | null): void {
  if (!queries) return
  for (const method of Object.values(queries)) {
    if (typeof method?.__dispose === "function") {
      method.__dispose()
    }
  }
}
