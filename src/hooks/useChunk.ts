import { useEffect, useRef } from "react"
import { createChunk } from "../"
import type { ChunkConfig, StoreInstance } from "../types/chunk"

type CreatedStore<
  S extends Record<string, any>,
  A extends Record<string, any>,
  AX extends Record<string, any>,
  V extends Record<string, any>,
> = StoreInstance<S, A, AX, V> & {
  dispose?: () => void
}

type UseChunkOptions = {
  /**
   * Callback fired before store will be utilized
   * @param store
   */
  onDispose?: (store: any) => void
  /**
   * Callback fired when store created
   * @param store
   */
  onInit?: (store: any) => void
}

/**
 * Create StoreInstance for component lifecycle.
 * Auto dispose on unmount.
 */
export function useChunk<
  S extends Record<string, any>,
  A extends Record<string, any>,
  AX extends Record<string, any>,
  V extends Record<string, any>,
>(
  config: ChunkConfig<S, A, AX>,
  opts: UseChunkOptions = {}
): CreatedStore<S, A, AX, V> {
  const { onDispose, onInit } = opts

  const ref = useRef<CreatedStore<S, A, AX, V> | null>(null)

  if (ref.current === null) {
    ref.current = createChunk<S, A, AX, V>(config as any) as CreatedStore<
      S,
      A,
      AX,
      V
    >
    onInit?.(ref.current)
  }

  useEffect(() => {
    const store = ref.current!

    return () => {
      try {
        onDispose?.(store)
      } catch {}
      try {
        store.dispose?.()
      } catch {}
    }
  }, [])

  return ref.current!
}
