import { reaction } from "mobx"
import { getPersistenceEngine } from "../adapters/storageAdapter"
import type { ChunkConfig } from "../types/chunk"

/**
 * Setup persistence for specified state keys in a chunk config.
 * Uses the globally configured PersistenceEngine, supporting async operations.
 *
 * @template TState - Shape of the state object.
 * @param config - The chunk configuration with `persist` keys.
 * @param self - The store instance whose state will be observed for persistence.
 */
export function setupPersistence<TState extends Record<string, unknown>>(
  config: ChunkConfig<TState, any, any, any>,
  self: TState & Record<string, unknown>
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
      const result = engine.set(config.name, payload)
      if (result instanceof Promise) {
        result.catch((err) => {
          console.error(`Persistence set error for ${config.name}:`, err)
        })
      }
    },
    { fireImmediately: true }
  )
}
