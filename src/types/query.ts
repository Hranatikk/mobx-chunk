// ---------------------------------------------------------------------------
// Definition types (used in ChunkConfig.queries builder)
// ---------------------------------------------------------------------------

export interface QueryDefinition<
  TData = any,
  TArgs extends any[] = any[],
> {
  fn: (...args: TArgs) => Promise<TData>
  type: "query"
  cacheTime?: number
}

export interface InfiniteQueryDefinition<
  TData = any,
  TPageParam = unknown,
> {
  fn: (pageParam: TPageParam) => Promise<TData>
  type: "infiniteQuery"
  cacheTime?: number
  initialPageParam: TPageParam
  getNextPageParam: (lastPage: TData) => TPageParam | undefined
}

export interface MutationDefinition<
  TData = any,
  TArgs extends any[] = any[],
> {
  fn: (...args: TArgs) => Promise<TData>
  type: "mutation"
}

export type AnyQueryDefinition =
  | QueryDefinition
  | InfiniteQueryDefinition
  | MutationDefinition

export type QueriesRecord = Record<string, AnyQueryDefinition>

// ---------------------------------------------------------------------------
// Observable state types
// ---------------------------------------------------------------------------

export interface QueryEntryState<TData = unknown> {
  data: TData | undefined
  error: unknown
  status: "idle" | "pending" | "success" | "error"
  readonly isPending: boolean
  readonly isError: boolean
  readonly isSuccess: boolean
  fetchedAt: number | null
}

export interface InfiniteQueryState<
  TData = unknown,
  TPageParam = unknown,
> {
  pages: TData[]
  pageParams: TPageParam[]
  error: unknown
  status: "idle" | "pending" | "success" | "error"
  readonly isPending: boolean
  readonly isFetchingNextPage: boolean
  readonly isError: boolean
  readonly isSuccess: boolean
  readonly hasNextPage: boolean
  fetchedAt: number | null
}

// ---------------------------------------------------------------------------
// Method types (attached to store.queries)
// ---------------------------------------------------------------------------

export interface QueryMethod<
  TData = unknown,
  TArgs extends any[] = any[],
> {
  (...args: TArgs): Promise<TData>
  getState(...args: TArgs): QueryEntryState<TData>
  refetch(...args: TArgs): Promise<TData>
  invalidate(...args: TArgs): void
  invalidateAll(): void
  /** Dispose all internal reactions / clear cache. Called automatically by chunk.dispose(). */
  __dispose(): void
}

export interface InfiniteQueryMethod<
  TData = unknown,
  TPageParam = unknown,
> {
  (): Promise<TData>
  getState(): InfiniteQueryState<TData, TPageParam>
  fetchNextPage(): Promise<void>
  refetch(): Promise<void>
  invalidate(): void
  __dispose(): void
}

export interface MutationMethod<
  TData = unknown,
  TArgs extends any[] = any[],
> {
  (...args: TArgs): Promise<TData>
  state: QueryEntryState<TData>
  reset(): void
  __dispose(): void
}

// ---------------------------------------------------------------------------
// Hook types
// ---------------------------------------------------------------------------

export interface UseQueryOptions {
  enabled?: boolean
}

export interface QueryResult<TData = unknown> {
  data: TData | undefined
  error: unknown
  isPending: boolean
  isError: boolean
  isSuccess: boolean
  refetch: () => Promise<TData>
}

export interface UseInfiniteQueryOptions {
  enabled?: boolean
}

export interface InfiniteQueryResult<
  TData = unknown,
  TPageParam = unknown,
> {
  data: { pages: TData[]; pageParams: TPageParam[] } | undefined
  error: unknown
  isPending: boolean
  isError: boolean
  isSuccess: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => Promise<void>
  refetch: () => Promise<void>
}

export interface MutationResult<
  TData = unknown,
  TArgs extends any[] = any[],
> {
  mutate: (...args: TArgs) => void
  mutateAsync: (...args: TArgs) => Promise<TData>
  data: TData | undefined
  error: unknown
  isPending: boolean
  isError: boolean
  isSuccess: boolean
  reset: () => void
}

// ---------------------------------------------------------------------------
// Mapped type: resolve definitions -> methods on store.queries
// ---------------------------------------------------------------------------

export type ResolveQueries<T extends QueriesRecord> = {
  [K in keyof T]: T[K] extends QueryDefinition<infer D, infer A>
    ? QueryMethod<D, A>
    : T[K] extends InfiniteQueryDefinition<infer D, infer P>
      ? InfiniteQueryMethod<D, P>
      : T[K] extends MutationDefinition<infer D, infer A>
        ? MutationMethod<D, A>
        : never
}

export type QueriesBuilder = (self: any) => QueriesRecord
