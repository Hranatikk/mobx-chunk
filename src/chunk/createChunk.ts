import type { IReactionDisposer } from "mobx"
import type { ChunkConfig, StoreInstance } from "../types/chunk"
import type { RecordWithAny, RecordWithAnyFn } from "../types/common"
import { createActions } from "./createActions"
import { createAsyncActions } from "./createAsyncActions"
import { createLoadingAnnotations } from "./createLoadingAnnotations"
import { createSelectors } from "./createSelectors"
import { createStateAnnotations } from "./createStateAnnotations"
import { setupPersistence } from "./persist"
import { rehydrateChunkState } from "./rehydration"

/**
 * Factory function to create a MobX store (chunk) based on the provided configuration.
 * It hydrates persisted state (sync or async) and sets up subsequent persistence.
 *
 * @template TState - Shape of the state object.
 * @template TActions - Synchronous action methods.
 * @template TAsync - Asynchronous (flow) methods.
 * @template TSelectors - Computed view methods.
 *
 * @param config - Configuration defining state, actions, async, views, and persistence.
 * @returns A new store instance with hydrated or default state.
 */
export function createChunk<
  TState extends RecordWithAny,
  TActions extends RecordWithAnyFn = {},
  TAsync extends RecordWithAnyFn = {},
  TSelectors extends RecordWithAnyFn = {},
>(
  config: ChunkConfig<TState, TActions, TAsync, TSelectors>
): StoreInstance<TState, TActions, TAsync, TSelectors> {
  class Store {
    constructor() {
      const self = this as unknown as StoreInstance<
        TState,
        TActions,
        TAsync,
        TSelectors
      >

      /**
       * Generate default state
       */
      Object.assign(self, config.initialState)
      createStateAnnotations(self, config)

      /**
       * Create setters and join them with custom actions
       */
      const actions = createActions(self, config)
      Object.defineProperty(self, "actions", {
        configurable: true,
        enumerable: false,
        value: actions,
        writable: true,
      })

      /**
       * Create getters and join them with custom selectors
       */
      const selectors = createSelectors(self, config)
      Object.defineProperty(self, "selectors", {
        configurable: true,
        enumerable: false,
        value: selectors,
        writable: true,
      })

      /**
       * Generate isLoading keys for async functions
       */
      const isLoading = createLoadingAnnotations(self, config)
      Object.defineProperty(self, "isLoading", {
        configurable: true,
        enumerable: false,
        value: isLoading,
        writable: true,
      })

      /**
       * Create async functions wrapper
       */
      const asyncActions = createAsyncActions(self, config)
      Object.defineProperty(self, "asyncActions", {
        configurable: true,
        enumerable: false,
        value: asyncActions,
        writable: true,
      })

      rehydrateChunkState(config, self as any)

      /**
       * Disposers
       */
      const disposers: IReactionDisposer[] = []
      const persistDisposer = setupPersistence(config, self as any)
      if (persistDisposer) disposers.push(persistDisposer)

      let disposed = false
      Object.defineProperty(self, "dispose", {
        enumerable: false,
        value: () => {
          if (disposed) return
          disposed = true
          while (disposers.length) {
            try {
              disposers.pop()!()
            } catch {}
          }
        },
      })
    }
  }

  return new Store() as StoreInstance<TState, TActions, TAsync, TSelectors>
}
