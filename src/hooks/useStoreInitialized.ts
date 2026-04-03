import { useEffect, useState } from "react"
import type { StoreInstance } from "../types/chunk"

/**
 * Returns `true` after the component mounts, signaling that the
 * provided store instances are ready to be used.
 *
 * @param _storeInstances - store instances (kept for API compatibility)
 * @returns isInitialized - false until the effect runs, then true
 */
export function useStoreInitialized(
  _storeInstances: StoreInstance<{}, {}, {}, {}>[]
): boolean {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    setIsInitialized(true)
  }, [])

  return isInitialized
}
