import type { RecordWithAny, RecordWithAnyFn } from "./common"
import type { QueriesRecord, ResolveQueries } from "./query"

/**
 * Configuration for creating a MobX chunk (store).
 *
 * @template TState - Shape of the state object.
 * @template TActions - Synchronous action methods.
 * @template TAsync - Asynchronous (generator) methods.
 * @template TSelectors - Computed view methods.
 * @template TQueries - Query/mutation definitions.
 */
export interface ChunkConfig<
  TState extends RecordWithAny,
  TActions extends RecordWithAnyFn = {},
  TAsync extends RecordWithAnyFn = {},
  TSelectors extends RecordWithAnyFn = {},
  TQueries extends QueriesRecord = {},
> {
  name: string
  initialState: TState
  actions?: (self: any) => TActions
  asyncActions?: (self: any) => TAsync
  views?: (self: any) => TSelectors
  queries?: (self: any) => TQueries
  persist?: Array<keyof TState>
  /** Debounce delay (ms) for persistence writes. Defaults to 300. */
  persistDebounce?: number
}

/**
 * Type of the store instance returned by createChunk.
 * It merges state, actions, async, atomic, and view methods,
 * and also includes generated getters/setters for each state key.
 */
export type StoreInstance<
  TState extends RecordWithAny,
  TActions extends RecordWithAnyFn,
  TAsync extends RecordWithAnyFn,
  TSelectors extends RecordWithAnyFn,
  TQueries extends QueriesRecord = {},
> = {
  actions: Actions<TState, TActions>
  asyncActions: TAsync
  dispose: () => void
  selectors: Selectors<TState, TSelectors>
  isLoading: Record<keyof TAsync, boolean>
  queries: ResolveQueries<TQueries>
}

type Actions<S extends RecordWithAny, T> = T & {
  [K in keyof S as `set${Capitalize<string & K>}`]: (value: S[K]) => void
}
type Selectors<S extends RecordWithAny, T> = {
  [K in keyof S as `get${Capitalize<string & K>}`]: S[K]
} & {
  [K in keyof T]: T[K] extends () => any ? ReturnType<T[K]> : T[K]
}
