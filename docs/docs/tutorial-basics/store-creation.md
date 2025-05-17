---
sidebar_position: 1
---

# Store creation

A quick tour of the essential steps when working with **mobx-chunk**—from defining state to wiring up async logic.

## Creating a store
Declare your data structure and computed views in a single, declarative object. **mobx-chunk** generates all the wiring for you.

```
// store.ts
import { createChunk } from "mobx-chunk"
import { actions, type TActions } from "./actions"
import { asyncActions, type TAsyncActions } from "./asyncActions"
import { selectors, type TSelectors } from "./selectors"

export type TState = {
  token: string
}
export const authStore = createChunk<
  TState,
  TActions,
  TAsyncActions,
  TSelectors
>({
  initialState: {
    token: "",
  } satisfies TState,
  name: "authStore",

  actions,
  asyncActions,
  views: selectors,
})

export type TAuthStore = typeof authStore
```

## Creating actions
Add synchronous methods for atomic state updates. Every action is wrapped in `runInAction`, ensuring data stays consistent.

```
// actions.ts
import type { TState } from "./chunk"

export function actions<Store extends TState>(store: Store) {
  return {
    changeToken(token: string) {
      store.token = String(Date.now())
    },
  }
}
export type TActions = ReturnType<typeof actions>
```

## Creating async actions
Describe long-running operations as generator flows or `async/await` functions. Each one automatically gains an `isLoading.<name>` flag so you can track its progress in the UI.

```
// asyncActions.ts
import type { TState } from "./chunk"

export function asyncActions<Store extends TState>(store: Store) {
  return {
    // using async/await
    async asyncFunc() {
      await new Promise<void>((resolve) =>
        setTimeout(() => {
          store.token = String(Date.now())
          resolve()
        }, 7000)
      )
    },

    // using generators
    *asyncGenerator() {
      yield new Promise<void>((resolve) =>
        setTimeout(() => {
          store.token = String(Date.now())
          resolve()
        }, 7000)
      )
    },
  }
}

export type TAsyncActions = ReturnType<typeof asyncActions>
```

## Using views (custom selectors)
Need more than predefined `computed` fields? Combine any slice of state on demand with **views**. Pass a selector to `useComputed` (or call `.view()` inside another store) to get a memoised, reactive value without adding extra fields to the store definition.

```
// selectors.ts (or views.ts)
import type { TState } from "./chunk"

export function selectors(store: TState) {
  return {
    isAuthenticated(): boolean {
      return Boolean(store.token)
    },
  }
}
export type TSelectors = ReturnType<typeof selectors>

```