---
sidebar_position: 1
---

# API: `createChunk`

Define a self-contained, type-safe MobX store slice ("chunk") with optional custom logic, persistence, and async support.

```ts
function createChunk<
  State extends object,
  Actions extends Record<string, (...args: any[]) => any> = {},
  AsyncActions extends Record<string, (...args: any[]) => Promise<any> | Generator<any, any, any>> = {},
  Views extends Record<string, (...args: any[]) => any> = {}
>(
  options: CreateChunkOptions<State, Actions, AsyncActions, Views>
): Chunk<State, Actions, AsyncActions, Views>
```

## Type Parameters

* `State` — shape of the store’s observable state.
* `Actions` — custom synchronous action factories (default: `{}`).
* `AsyncActions` — custom async action factories (default: `{}`).
* `Views` — custom selectors / computed factories (default: `{}`).

## `CreateChunkOptions` Interface

```ts
interface CreateChunkOptions<
  State,
  Actions,
  AsyncActions,
  Views
> {
  /**
   * Unique store name used in error messages and persistence keys.
   */
  name: string;

  /**
   * Initial values for the store state.
   */
  initialState: State;

  /**
   * Keys of state fields to persist. Values are serialized via your configured engine.
   */
  persist?: Array<keyof State & string>;

  /**
   * Function returning an object of synchronous actions.
   */
  actions?: (store: State) => Actions;

  /**
   * Function returning an object of async actions or generators.
   */
  asyncActions?: (store: State) => AsyncActions;

  /**
   * Function returning an object of selector (view) functions.
   */
  views?: (store: State) => Views;
}
```

## Return Type: `Chunk`

```ts
interface Chunk<
  State,
  Actions,
  AsyncActions,
  Views
> {
  /**
   * Observable state.
   */
  state: State;

  /**
   * Auto-generated setters: set${Capitalize<keyof State>}(...).
   */
  actions: Actions & AutoSetters<State>;

  /**
   * Auto-generated getters: get${Capitalize<keyof State>}().
   */
  selectors: Views & AutoGetters<State>;

  /**
   * User-defined async functions under asyncActions.
   */
  asyncActions: AsyncActions;

  /**
   * Loading flags for each async action (boolean).
   */
  isLoading: { [K in keyof AsyncActions]: boolean };
}
```

### Auto-Generated Helpers

* **`AutoSetters<State>`**: For each `K in keyof State`, adds a method:

  ```ts
  set${Capitalize<string & K>}(value: State[K]): void
  ```

* **`AutoGetters<State>`**: For each `K in keyof State`, adds a method:

  ```ts
  get${Capitalize<string & K}>(): State[K]
  ```

## Example

```ts
import { createChunk, runInAction } from "mobx-chunk";

export interface User {
  id: string;
  name: string;
}

export type UserState = { userList: User[] };

export const userStore = createChunk<
  UserState,
  {},
  { fetchUsers: () => Promise<void> },
  {}
>({
  name: "user",
  initialState: { userList: [] },
  asyncActions: (store) => ({
    async fetchUsers() {
      const users = await api.getUsers();

      runInAction(() => {
        store.actions.setUserList(users);
      })
    },
  }),
});

// Usage
userStore.actions.setUserList([{ id: "1", name: "Alice" }]);
userStore.asyncActions.fetchUsers();
```

With `createChunk`, you get a fully-typed store slice equipped with auto-generated setters/getters, custom async flows, and loading flags.
