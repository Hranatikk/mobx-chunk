---
sidebar_position: 7
---


# API: `configurePersistenceEngine`

Global configuration for persisting state fields in **mobx-chunk**. Plug any storage engine by providing CRUD methods for string-based keys and values.

```ts
function configurePersistenceEngine(
  engine: PersistenceEngine
): void
```

## `PersistenceEngine` Interface

```ts
interface PersistenceEngine {
  /**
   * Clear all stored entries or scoped entries if key provided.
   * @param key Optional prefix or specific key to clear.
   * */
  clear: (key?: string) => void | Promise<void>;

  /**
   * Retrieve a stored string by key.
   * Returns either a string or a promise resolving to a string or null.
   */
  get: (key: string) => string | Promise<string | null>;

  /**
   * Remove a stored entry by key.
   */
  remove: (key: string) => void | Promise<void>;

  /**
   * Store a string value under a key.
   */
  set: (key: string, value: string) => void | Promise<void>;
}
```

## Usage

Call `configurePersistenceEngine` once, preferably in your app’s root or entry point before any `createChunk` calls that use `persist`:

```ts
import { configurePersistenceEngine } from "mobx-chunk";

// Example: React Native MMKV
import { MMKV } from "react-native-mmkv";
const storage = new MMKV();

configurePersistenceEngine({
  clear: () => storage.clearAll(),
  get:    (key) => storage.getString(key),
  remove: (key) => storage.delete(key),
  set:    (key, value) => storage.set(key, value),
});
```

## Behavior

* **Read on Initialization**: When a chunk with `persist` fields is created, stored values are read automatically and merged into the initial state.
* **Write on Change**: Whenever a `set${Field}` action updates a persisted field, the new value is serialized and saved via `engine.set` under a composed key: `${chunkName}:${field}`.
* **Remove on Deletion**: If a persisted field is removed (e.g., set to `undefined`), `engine.remove` is called for the key.
* **Clear All**: Calling `engine.clear()` purges all keys. Some engines support namespaced clearing by passing a prefix.

## Return Value

* `void` — there’s no return. After configuration, the engine is used under the hood by persisted chunks.

Use `configurePersistenceEngine` to integrate any storage solution (synchronous or asynchronous) for persisted fields across sessions.
