import { useCallback, useRef, useSyncExternalStore } from "react"
import { reaction } from "mobx"

/**
 * React hook to subscribe to a MobX computed value or any observable expression.
 * Uses `useSyncExternalStore` to prevent tearing in React concurrent mode.
 *
 * @template T - The type of the value returned by the selector.
 * @param {() => T} selector - A function that returns a MobX observable or computed value.
 * @returns {T} The current value of the selector, automatically updated on changes.
 */
export function useComputed<T>(selector: () => T): T {
  const selectorRef = useRef(selector)
  selectorRef.current = selector

  const snapshotRef = useRef<T>(null!)
  const initRef = useRef(false)
  if (!initRef.current) {
    snapshotRef.current = selector()
    initRef.current = true
  }

  const subscribe = useCallback((onStoreChange: () => void) => {
    const disposer = reaction(
      () => selectorRef.current(),
      (newValue) => {
        snapshotRef.current = newValue
        onStoreChange()
      }
    )
    return disposer
  }, [])

  const getSnapshot = useCallback(() => snapshotRef.current, [])

  return useSyncExternalStore(subscribe, getSnapshot)
}
