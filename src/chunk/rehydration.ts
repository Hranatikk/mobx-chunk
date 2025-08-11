import { runInAction } from "mobx"
import { getPersistenceEngine } from "../adapters/storageAdapter"
import type { ChunkConfig } from "../types/chunk"

/**
 * Rehydrate a store's state from the configured persistence engine.
 * Supports both sync and async get() implementations.
 *
 * @param config — Initial chunk config
 * @param self — Store instance
 */
export function rehydrateChunkState<Self extends object>(
  config: ChunkConfig<Self, any, any, any>,
  self: Self
) {
  try {
    if (!(self as any).__hydrated) {
      Object.defineProperty(self as any, "__hydrated", {
        configurable: true,
        enumerable: false,
        value: false,
        writable: true,
      })
    }

    if (!config.persist?.length) return

    const engine = getPersistenceEngine()
    if (!engine.get) return

    const rawOrPromise = engine.get(`${config.name}Store`)

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
          if (!config.persist?.includes(key as keyof Self)) return

          try {
            ;(self as any)[key] = JSON.parse(val)
          } catch {
            ;(self as any)[key] = val
          }
        })
      })
    }

    if (rawOrPromise instanceof Promise) {
      rawOrPromise
        .then((raw) => {
          hydrate(raw)
          ;(self as any).__hydrated = true
        })
        .catch((err) => {
          console.error(`Hydration error for chunk '${config.name}Store':`, err)
          ;(self as any).__hydrated = true
        })
    } else {
      hydrate(rawOrPromise as string)
      ;(self as any).__hydrated = true
    }
  } catch (err) {
    console.error(`Hydration error ${err}`)
    ;(self as any).__hydrated = true
  }
}
