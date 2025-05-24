import { makeObservable, observable } from "mobx"
import type { ChunkConfig } from "../types/chunk"
/**
 * Create annotations for initial state
 * 1) Getters for every field in initialState: as get${Cap(field)}
 * 2) All custom selector functions
 *
 * @param self — Store instance
 * @param config — Initial chunk config
 * @return - selectors Object
 */
export function createStateAnnotations<
  Self extends object,
  TState extends Record<string, any>,
>(
  self: Self,
  config: ChunkConfig<TState, any, any, any>
): Record<string, unknown> {
  const annotations: Record<string, any> = {}
  const stateKeys = Object.keys(config.initialState) as Array<keyof TState>

  stateKeys.forEach((key) => {
    annotations[key as string] = observable
  })

  makeObservable(self, annotations)

  return annotations
}
