/**
 * Async-capable API for persistence engines.
 */
export interface PersistenceEngine {
  /**
   * Save a string value by key. Can be sync or async.
   * @param key - The storage key.
   * @param value - The stringified value to store.
   */
  set(key: string, value: string): void | Promise<void>

  /**
   * Optionally retrieve a stored string. Can be sync or async.
   * @param key - The storage key.
   * @returns The stored string or null, or a Promise thereof.
   */
  get?(key: string): string | null | undefined | Promise<string | null>

  /**
   * Remove a stored value by key. Can be sync or async.
   * @param key - The storage key to remove.
   */
  remove(key: string): void | Promise<void>
  clear?(): void | Promise<void>
}

let engine: PersistenceEngine = {
  clear: () => {},
  get: () => null,
  remove: () => {},
  set: () => {},
}

/**
 * Configure the global persistence engine.
 * Must be called once at app startup.
 *
 * @param e - User-provided implementation of PersistenceEngine.
 */
export function configurePersistenceEngine(e: PersistenceEngine) {
  engine = e
}

/**
 * Retrieve the current persistence engine.
 *
 * @returns The configured PersistenceEngine.
 */
export function getPersistenceEngine(): PersistenceEngine {
  return engine
}
