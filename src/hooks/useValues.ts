import { useEffect, useState } from "react"
import { reaction } from "mobx"

/**
 * React hook to subscribe to MobX store values or getters.
 * It returns an object of the same shape as the input getters,
 * automatically unwrapping getter functions to their return values.
 *
 * @template G - An object whose values are either getter functions or plain values.
 *
 * @param {G} getters - An object mapping keys to getter functions or values.
 *                        Getter functions should return a MobX observable value.
 * @returns  An object with the same keys as `getters`, where each getter function
 *          has been replaced by its return value, and plain values are unchanged.
 */
export function useValues<G extends Record<string, (() => any) | any>>(
  getters: G
): { [K in keyof G]: G[K] extends () => infer R ? R : G[K] } {
  type Values = { [K in keyof G]: G[K] extends () => infer R ? R : G[K] }

  const [values, setValues] = useState<Values>(
    () =>
      Object.fromEntries(
        Object.entries(getters).map(([key, getter]) => [
          key,
          typeof getter === "function" ? (getter as () => any)() : getter,
        ])
      ) as Values
  )

  useEffect(() => {
    const disposer = reaction<Values>(
      () =>
        Object.fromEntries(
          Object.entries(getters).map(([key, getter]) => [
            key,
            typeof getter === "function" ? (getter as () => any)() : getter,
          ])
        ) as Values,
      (current, previous) => {
        if (!previous || JSON.stringify(current) !== JSON.stringify(previous)) {
          setValues(current)
        }
      }
    )

    return () => disposer()
  }, [getters])

  return values
}
