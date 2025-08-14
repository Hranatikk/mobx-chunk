import { flow, makeObservable, runInAction } from "mobx"
import { runActionInterceptors } from "../adapters/middlewareAdapter"
import type { ChunkConfig, StoreInstance } from "../types/chunk"
import type { AnyFn, RecordWithAnyFn } from "../types/common"
/**
 * Create actions object with:
 * 1) Default setters for initialState: set${Cap(key)}
 * 2) Custom actions
 *
 * @param self — Store instance
 * @param config — Initial chunk config
 * @returns actions Object
 */
export function createAsyncActions<
  TState extends Record<string, any>,
  TAsync extends RecordWithAnyFn,
>(
  self: StoreInstance<TState, any, TAsync, any>,
  config: ChunkConfig<TState, any, TAsync, any>
): RecordWithAnyFn {
  const async = config.asyncActions?.(self) ?? ({} as RecordWithAnyFn)
  const defaultAsyncActions: RecordWithAnyFn = {}

  Object.entries(async).forEach(([name, fn]) => {
    const original =
      fn.constructor.name === "GeneratorFunction"
        ? flow((fn as any).bind(self) as any)
        : (fn as AnyFn).bind(self)

    const wrapped = (...args: unknown[]) => {
      const counters = (self as any).__loadingCounters as
        | Record<string, number>
        | undefined

      runActionInterceptors(
        { actionName: name, args, chunkName: config.name, store: self },
        () => {}
      )
      if (counters) {
        runInAction(() => {
          counters[name] = (counters[name] ?? 0) + 1
        })
      }

      const res = runActionInterceptors(
        { actionName: name, args, chunkName: config.name, store: self },
        () => original(...args)
      )

      Promise.resolve(res).finally(() =>
        runInAction(() => {
          if (counters) {
            const next = (counters[name] ?? 1) - 1
            counters[name] = next > 0 ? next : 0
          }
        })
      )

      return res
    }

    Object.defineProperty(defaultAsyncActions, name, {
      configurable: true,
      enumerable: false,
      value: wrapped,
      writable: true,
    })
  })

  const annotations = Object.fromEntries(
    Object.keys(defaultAsyncActions).map((n) => [n, flow])
  )

  makeObservable(defaultAsyncActions, annotations as any)

  return defaultAsyncActions
}
