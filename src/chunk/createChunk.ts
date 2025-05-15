import { flow, makeObservable, observable, runInAction } from "mobx"
import { runActionInterceptors } from "../adapters/middlewareAdapter"
import type { ChunkConfig, StoreInstance } from "../types/chunk"
import type { AnyFn, RecordWithAny, RecordWithAnyFn } from "../types/common"
import { capitalize } from "../utils/capitalize"
import { generateAnnotations } from "./annotations"
import { setupPersistence } from "./persist"
import { rehydrateChunkState } from "./rehydration"

/**
 * Factory function to create a MobX store (chunk) based on the provided configuration.
 * It hydrates persisted state (sync or async) and sets up subsequent persistence.
 *
 * @template TState - Shape of the state object.
 * @template TActions - Synchronous action methods.
 * @template TAsync - Asynchronous (flow) methods.
 * @template TViews - Computed view methods.
 *
 * @param config - Configuration defining state, actions, async, views, and persistence.
 * @returns A new store instance with hydrated or default state.
 */
export function createChunk<
  TState extends RecordWithAny,
  TActions extends RecordWithAnyFn = {},
  TAsync extends RecordWithAnyFn = {},
  TViews extends RecordWithAnyFn = {},
>(
  config: ChunkConfig<TState, TActions, TAsync, TViews>
): StoreInstance<TState, TActions, TAsync, TViews> {
  class Store {
    constructor() {
      const self = this as unknown as StoreInstance<
        TState,
        TActions,
        TAsync,
        TViews
      >

      Object.assign(self, config.initialState)

      Object.keys(config.initialState).forEach((key) => {
        const cap = capitalize(key)
        Object.defineProperty(self, `set${cap}`, {
          configurable: true,
          enumerable: false,
          value: (v: any) => {
            ;(self as any)[key] = v
          },
          writable: true,
        })
      })

      const sync = config.actions?.(self) ?? ({} as RecordWithAnyFn)
      const async = config.asyncActions?.(self) ?? ({} as RecordWithAnyFn)

      const initialLoading = Object.fromEntries(
        Object.keys(async).map((name) => [name, false])
      ) as Record<keyof TAsync, boolean>
      self.isLoading = initialLoading as Record<keyof TAsync, boolean>

      const loadingAnnotations: Record<string, any> = {}
      Object.keys(async).forEach((name) => {
        loadingAnnotations[name] = observable
      })
      makeObservable(self.isLoading, loadingAnnotations)

      Object.entries({ ...sync, ...async }).forEach(([name, fn]) => {
        const original =
          fn.constructor.name === "GeneratorFunction"
            ? flow((fn as any).bind(self) as any)
            : (fn as AnyFn).bind(self)

        const wrapped = (...args: unknown[]) => {
          if (name in async) {
            runInAction(() => {
              self.isLoading[name as keyof TAsync] = true
            })
          }

          const res = runActionInterceptors(
            { actionName: name, args, chunkName: config.name, store: self },
            () => original(...args)
          )

          if (name in async) {
            Promise.resolve(res).finally(() =>
              runInAction(() => {
                self.isLoading[name as keyof TAsync] = false
              })
            )
          }

          return res
        }

        Object.defineProperty(self, name, {
          configurable: true,
          enumerable: false,
          value: wrapped,
          writable: true,
        })
      })

      if (config.views) {
        const viewsObj = config.views(self)
        Object.entries(viewsObj).forEach(([name, fn]) => {
          Object.defineProperty(self, name, {
            configurable: true,
            enumerable: false,
            get: fn.bind(self),
          })
        })
      }

      const annotations = generateAnnotations(
        config,
        sync,
        async,
        config.views ? config.views(self) : undefined
      )

      annotations.isLoading = observable

      makeObservable(self, annotations)
      rehydrateChunkState(config, self)
      setupPersistence(config, self as any)
    }
  }

  return new Store() as StoreInstance<TState, TActions, TAsync, TViews>
}
