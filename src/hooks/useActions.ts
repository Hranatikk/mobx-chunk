// src/hooks/useActions.ts
import { useMemo } from "react"

/**
 * React hook to extract all action methods from a MobX chunk store instance.
 *
 * It returns an object containing only the function-valued properties of the store,
 * including non-enumerable ones, and memoizes the result.
 *
 * @template TStore - Type of the chunk store instance.
 * @param {TStore} store - The MobX store created via createChunk.
 * @returns An object with keys of all function-valued properties (actions) from the store.
 */

type ActionKey<TStore> = {
  [K in keyof TStore]: TStore[K] extends (...args: any[]) => any ? K : never
}[keyof TStore]

export function useActions<TStore extends object>(
  store: TStore
): Pick<TStore, ActionKey<TStore>> {
  return useMemo(() => {
    const result = {} as Pick<TStore, ActionKey<TStore>>
    const keys = Object.getOwnPropertyNames(store) as ActionKey<TStore>[]

    for (const key of keys) {
      const val = (store as any)[key]
      if (typeof val === "function") {
        result[key] = val
      }
    }

    return result
  }, [store])
}
