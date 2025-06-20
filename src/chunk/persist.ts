import { reaction } from "mobx"
import { getPersistenceEngine } from "../adapters/storageAdapter"
import type { ChunkConfig } from "../types/chunk"

/**
 * Setup persistence for specified state keys in a chunk config.
 * Uses the globally configured PersistenceEngine, supporting async operations.
 *
 * @param config — Initial chunk config
 * @param self — Store instance
 */
export function setupPersistence<Self extends object>(
  config: ChunkConfig<Self, any, any, any>,
  self: Self
) {
  if (!config.persist?.length) return

  const engine = getPersistenceEngine()

  reaction(
    () => config.persist!.map((k) => self[k]),
    (vals) => {
      const toSave: Record<string, string> = {}
      config.persist!.forEach((k, i) => {
        toSave[k as string] = JSON.stringify(vals[i])
      })
      const payload = JSON.stringify(toSave)
      const result = engine.set(`${config.name}Store`, payload)
      if (result instanceof Promise) {
        result.catch((err) => {
          console.error(`Persistence set error for ${config.name}Store:`, err)
        })
      }
    },
    { fireImmediately: true }
  )
}
