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

  const counters: Record<string, number> = Object.fromEntries(
    names.map((n) => [n as string, 0])
  )

  const counterAnn: Record<string, IObservableFactory> = Object.fromEntries(
    names.map((n) => [n as string, observable as IObservableFactory])
  )

  makeObservable(counters, counterAnn as AnnotationsMap<typeof counters, never>)

  const isLoading: Record<string, boolean> = {}

  names.forEach((n) => {
    Object.defineProperty(isLoading, n, {
      configurable: true,
      enumerable: true,
      get() {
        return counters[n as string] > 0
      },
    })
  })

  const loadingAnn: Record<string, typeof computed> = Object.fromEntries(
    names.map((n) => [n as string, computed])
  )

  makeObservable(isLoading, loadingAnn as AnnotationsMap<typeof isLoading, never>)

  Object.defineProperty(self as any, "__loadingCounters", {
    configurable: true,
    enumerable: false,
    value: counters,
    writable: false,
  })

  return isLoading
}
