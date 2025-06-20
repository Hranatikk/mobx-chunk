---

sidebar\_position: 4

---

# API: `combineAsync`

Utility for merging multiple builder functions into a single flat API of asynchronous methods. Each builder receives a shared context (`self`) and returns an object of async functions; `combineAsync` binds them into one API, preserving original signatures.

```ts
function combineAsync<
  T extends Record<string, (self: any) => Record<string, (...args: any[]) => Promise<any>>>
>(
  builders: T,
  store: any
): CombinedAsync<T>
```

## Parameters

* `builders` (`T`):
  A record of builder functions. Each builder is `(self: any) => Record<string, (...args: any[]) => Promise<any>>`, returning an object of async methods.
* `store` (`any`):
  The shared `self` object passed to every builder.

## Return Value

* Returns **`CombinedAsync<T>`** — an object combining all async methods from each builder. Each method has signature `(...args: OriginalParameters) => Promise<OriginalReturnType>`.

## Behavior

* Iterates over all keys in `builders`.
* Calls each builder with `store` to retrieve its methods.
* Exposes each async method on the result object, forwarding arguments and return value.
* Methods remain bound to the provided `store` and preserve their `Promise`-based return types.

## Example

```ts
// userApi.ts
import type { TState } from "../chunk"

export const userApi = (store: TState) => ({
  async fetchUser(id: number) {
    // your async code
  },
  async updateUser(user: User) {
    // your async code
  },
})

// postApi.ts
export const postApi = (store: TState) => ({
  async fetchPost(id: number) {
    // your async code
  },
})

// api.ts
import { combineAsync } from 'mobx-chunk'
import { userApi } from './userApi'
import { postApi } from './postApi'

const asyncActions = combineAsync({ userApi, postApi })

export const exampleStore = createChunk<
  {},
  {},
  TAsyncActions,
  {}
>({
  initialState: {} satisfies TState,
  name: "example",

  asyncActions,
})
```

Use `combineAsync` when you need to unify multiple asynchronous modules under a common store without shadowing individual method signatures.
