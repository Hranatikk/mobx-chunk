import { makeObservable, observable } from "mobx"
import type { ChunkConfig } from "../types/chunk"
import type { RecordWithAnyFn } from "../types/common"

/**
 * Create isLoading object with all async func names:
 *
 * @param self — Store instance
 * @param config — Initial chunk config
 * @return - isLoading[name] Object
 */
export function createLoadingAnnotations<
  Self extends object,
  TState extends Record<string, any>,
  TAsync extends RecordWithAnyFn,
>(
  self: Self,
  config: ChunkConfig<TState, any, TAsync, any>
): Record<string, unknown> {
  const async = config.asyncActions?.(self) ?? ({} as RecordWithAnyFn)

  const initialLoading = Object.fromEntries(
    Object.keys(async).map((name) => [name, false])
  ) as Record<keyof TAsync, boolean>

  const annotations = {}
  Object.keys(async).forEach((name) => {
    annotations[name] = observable
  })

  makeObservable(initialLoading, annotations)

  return initialLoading
}
