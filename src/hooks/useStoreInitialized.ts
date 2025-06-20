import { useEffect, useState } from "react"
import type { StoreInstance } from "../types/chunk"

/**
 * Invokes each store factory when the component mounts
 * and sets `isInitialized` to true after the first execution.
 *
 * @param storeInstances - store instances
 * @returns isInitialized - false until the effect runs, then true
 */
export function useStoreInitialized(
  storeInstances: StoreInstance<{}, {}, {}, {}>[]
): boolean {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    storeInstances.forEach((store) => {
      store
    })
    setIsInitialized(true)
  }, [])

  return isInitialized
}
