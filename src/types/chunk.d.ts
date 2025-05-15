import type { RecordWithAny, RecordWithAnyFn } from "./common"

/**
 * Configuration for creating a MobX chunk (store).
 *
 * @template TState - Shape of the state object.
 * @template TActions - Synchronous action methods.
 * @template TAsync - Asynchronous (generator) methods.
 * @template TAtomic - Atomic action methods.
 * @template TViews - Computed view methods.
 */
export interface ChunkConfig<
  TState extends RecordWithAny,
  TActions extends RecordWithAnyFn = {},
  TAsync extends RecordWithAnyFn = {},
  TViews extends RecordWithAnyFn = {},
> {
  name: string
  initialState: TState
  actions?: (self: any) => TActions
  asyncActions?: (self: any) => TAsync
  views?: (self: any) => TViews
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
  TViews extends RecordWithAnyFn,
> = TState &
  TActions &
  TAsync &
  TViews & {
    isLoading: Record<keyof TAsync, boolean>
  }
