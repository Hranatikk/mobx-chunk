import { runInAction } from "mobx"
import { getPersistenceEngine } from "../adapters/storageAdapter"
import type { ChunkConfig } from "../types/chunk"

/**
 * Rehydrate a store's state from the configured persistence engine.
 * Supports both sync and async get() implementations.
 *
 * @template TState - Shape of the state object.
 * @param {ChunkConfig<TState, any, any, any>} config - The chunk configuration with `persist` keys.
 * @param {TState & Record<string, unknown>} self - The store instance to hydrate.
 */
export function rehydrateChunkState<TState extends Record<string, unknown>>(
  config: ChunkConfig<TState, any, any, any>,
  self: TState & Record<string, unknown>
) {
  try {
    const engine = getPersistenceEngine()
    if (!engine.get) return

    const rawOrPromise = engine.get(config.name)
    const hydrate = (raw: string | null) => {
      if (!raw) return
      let storeObj: Record<string, string>
      try {
        storeObj = JSON.parse(raw)
      } catch {
        return
      }
      runInAction(() => {
        Object.entries(storeObj).forEach(([key, val]) => {
          try {
            ;(self as any)[key] = JSON.parse(val)
          } catch {
            ;(self as any)[key] = val
          }
        })
      })
    }

    if (rawOrPromise instanceof Promise) {
      rawOrPromise.then(hydrate).catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.error(`Hydration error for chunk '${config.name}':`, err)
        }
      })
    } else {
      hydrate(rawOrPromise as string)
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`Hydration error ${err}`)
    }
  }
}
