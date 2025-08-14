import type { AnnotationsMap, IObservableFactory } from "mobx"
import { computed, makeObservable, observable } from "mobx"
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
  const async = (config.asyncActions?.(self) ?? {}) as RecordWithAnyFn
  const names = Object.keys(async) as Array<keyof TAsync>

  const counters = Object.fromEntries(
    names.map((n) => [n as string, 0])
  ) as Record<keyof TAsync, number>

  const counterAnn = Object.fromEntries(
    names.map((n) => [n as string, observable as IObservableFactory])
  ) as unknown as AnnotationsMap<typeof counters, never>

  makeObservable(counters as any, counterAnn)

  const isLoading = {} as Record<keyof TAsync, boolean>

  names.forEach((n) => {
    Object.defineProperty(isLoading, n, {
      configurable: true,
      enumerable: true,
      get() {
        return (counters as any)[n] > 0
      },
    })
  })

  const loadingAnn = Object.fromEntries(
    names.map((n) => [n as string, computed])
  ) as unknown as AnnotationsMap<typeof isLoading, never>

  makeObservable(isLoading as any, loadingAnn)

  Object.defineProperty(self as any, "__loadingCounters", {
    configurable: true,
    enumerable: false,
    value: counters,
    writable: false,
  })

  return isLoading
}
