import { useEffect, useState } from "react"
import { reaction } from "mobx"

/**
 * React hook to subscribe to a MobX computed value or any observable expression.
 *
 * @template T - The type of the value returned by the selector.
 * @param {() => T} selector - A function that returns a MobX observable or computed value.
 * @returns {T} The current value of the selector, automatically updated on changes.
 */
export function useComputed<T>(selector: () => T): T {
  const [value, setValue] = useState<T>(selector)

  useEffect(() => {
    const disposer = reaction(
      selector,
      (newValue) => {
        setValue(newValue)
      },
      { fireImmediately: false }
    )

    return () => disposer()
  }, [selector])

  return value
}
