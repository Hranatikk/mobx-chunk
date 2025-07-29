import type { RecordWithAny, RecordWithAnyFn } from "./common"

/**
 * Configuration for creating a MobX chunk (store).
 *
 * @template TState - Shape of the state object.
 * @template TActions - Synchronous action methods.
 * @template TAsync - Asynchronous (generator) methods.
 * @template TSelectors - Computed view methods.
 */
export interface ChunkConfig<
  TState extends RecordWithAny,
  TActions extends RecordWithAnyFn = {},
  TAsync extends RecordWithAnyFn = {},
  TSelectors extends RecordWithAnyFn = {},
> {
  name: string
  initialState: TState
  actions?: (self: any) => TActions
  asyncActions?: (self: any) => TAsync
  views?: (self: any) => TSelectors
  persist?: Array<keyof TState>
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
> = {
  actions: Actions<TState, TActions>
  asyncActions: TAsync
  selectors: Selectors<TState, TSelectors>
  isLoading: Record<keyof TAsync, boolean>
}

type Actions<S extends RecordWithAny, T> = T & {
  [K in keyof S as `set${Capitalize<string & K>}`]: (value: S[K]) => void
}
type Selectors<S extends RecordWithAny, T> = {
  [K in keyof S as `get${Capitalize<string & K>}`]: S[K]
} & {
  [K in keyof T]: T[K] extends () => any ? ReturnType<T[K]> : T[K]
}
