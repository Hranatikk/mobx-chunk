import { observable } from "mobx"
import type { ChunkConfig } from "../types/chunk"

/**
 * Generate MobX annotations based on the provided chunk configuration and methods.
 *
 * @template TState - Shape of the state object.
 * @template TAsync - Asynchronous (generator) methods.
 *
 * @param {ChunkConfig<TState, TAsync>} config - The chunk configuration object.
 * @returns {Record<string, any>} A mapping from property and method names to MobX annotation decorators.
 */
export function generateAnnotations<TState extends Record<string, unknown>>(
  config: ChunkConfig<TState>
): Record<string, any> {
  const annotations: Record<string, any> = {}
  const stateKeys = Object.keys(config.initialState) as Array<keyof TState>

  stateKeys.forEach((key) => {
    annotations[key as string] = observable
  })

  return annotations
}
