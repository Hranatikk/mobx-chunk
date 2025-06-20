---
sidebar_position: 6
---

# API: `useStoreInitialized`

React hook to defer rendering until specified MobX store instances are initialized. Returns a boolean flag that toggles from `false` to `true` immediately after the provided stores are referenced on component mount.

```ts
function useStoreInitialized(
  storeInstances: StoreInstance<{}, {}, {}, {}>[]
): boolean
```

## Parameters

* `storeInstances`: Array of store instances created via `createChunk`. Each element must conform to the `StoreInstance` type.

## Returns

* `isInitialized`: `boolean` flag. Initially `false` on first render; becomes `true` after the effect runs.

## Behavior

1. On component mount, the hook iterates through the `storeInstances` array to reference each store (triggering any creation or side effects).
2. After all stores have been referenced, it sets `isInitialized` to `true`.
3. The hook then causes a re-render of the consumer component so that UI can proceed once stores are ready.

## Example

```tsx
import React from "react"
import { useStoreInitialized } from "mobx-chunk"
import { authStore } from "../stores/auth"
import { postsStore } from "../stores/posts"

export function App() {
  const isReady = useStoreInitialized([authStore, postsStore])

  if (!isReady) {
    return <div>Loading stores…</div>
  }

  return <MainRouter />
}
```

## Usage

Use `useStoreInitialized` when:

* You have multiple MobX store instances created at module scope that must be referenced before UI renders.
* You want to avoid accessing uninitialized store state in your components.

---
