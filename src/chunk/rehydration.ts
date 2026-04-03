import { runInAction } from "mobx"
import { getPersistenceEngine } from "../adapters/storageAdapter"
import type { ChunkConfig } from "../types/chunk"

interface Hydratable {
  __hydrated: boolean
  [key: string]: unknown
}

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
  const target = self as unknown as Hydratable

  try {
    if (!target.__hydrated) {
      Object.defineProperty(target, "__hydrated", {
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
      if (!raw) {
        runInAction(() => {
          target.__hydrated = true
        })
        return
      }

      let storeObj: Record<string, string>
      try {
        storeObj = JSON.parse(raw)
      } catch {
        runInAction(() => {
          target.__hydrated = true
        })
        return
      }

      runInAction(() => {
        Object.entries(storeObj).forEach(([key, val]) => {
          if (!config.persist?.includes(key as keyof Self)) return

          try {
            target[key] = JSON.parse(val)
          } catch {
            target[key] = val
          }
        })
        target.__hydrated = true
      })
    }

    if (rawOrPromise instanceof Promise) {
      rawOrPromise
        .then((raw) => {
          hydrate(raw)
        })
        .catch((err) => {
          console.error(`Hydration error for chunk '${config.name}Store':`, err)
          runInAction(() => {
            target.__hydrated = true
          })
        })
    } else {
      hydrate(rawOrPromise as string)
    }
  } catch (err) {
    console.error(`Hydration error ${err}`)
    runInAction(() => {
      target.__hydrated = true
    })
  }
}
