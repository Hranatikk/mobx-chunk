import { computed, makeObservable } from "mobx"
import type { ChunkConfig } from "../types/chunk"
import type { AnyFn } from "../types/common"
import { capitalize } from "../utils/capitalize"

/**
 * Create selectors object with:
 * 1) Getters for every field in initialState: as get${Cap(field)}
 * 2) All custom selector functions
 *
 * @param self — Store instance
 * @param config — Initial chunk config
 * @return - selectors Object
 */
export function createSelectors<
  Self extends object,
  TState extends Record<string, any>,
  TSelectors extends Record<string, AnyFn> = {},
>(
  self: Self,
  config: ChunkConfig<TState, any, any, TSelectors>
): Record<string, unknown> {
  const selectors: Record<string, unknown> = {}
  const customSelectors = config.views ? config.views(self) : undefined

  Object.keys(config.initialState).forEach((key) => {
    const cap = capitalize(key)
    Object.defineProperty(selectors, `get${cap}`, {
      configurable: true,
      enumerable: false,
      get() {
        return (self as any)[key]
      },
    })
  })

  if (customSelectors) {
    Object.entries(customSelectors).forEach(([name, fn]) => {
      if (fn.length <= 0) {
        Object.defineProperty(selectors, name, {
          configurable: true,
          enumerable: false,
          get() {
            return (fn as AnyFn).call(self)
          },
        })
      } else {
        Object.defineProperty(selectors, name, {
          configurable: true,
          enumerable: false,
          value: fn.bind(self),
          writable: true,
        })
      }
    })
  }

  const annotations = Object.fromEntries(
    Object.keys(selectors).map((name) => [name, computed])
  )
  makeObservable(selectors, annotations)

  return selectors
}
