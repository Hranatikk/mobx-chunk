---
sidebar_position: 1
---

# Create Chunk

The `createChunk` function is the heart of **mobx-chunk**, allowing you to define a type-safe store slice ("chunk") with minimal boilerplate. It automatically generates actions, selectors, async actions, and loading flags based on your configuration and custom definitions.

## What `createChunk` Provides

* **Auto-generated Actions**: For each key in your state, a `set${ValueKey}` action (e.g., `setTodoList`).
* **Auto-generated Selectors**: For each key in your state, a `get${ValueKey}` selector (e.g., `getTodoList`).
* **Custom Async Actions**: All your defined async functions live under `store.asyncActions`.
* **Loading Indicators**: `store.isLoading` holds boolean flags for each async action (e.g., `isLoading.asyncFunctionExample`).
* **Persistence**: Opt into persisting fields (e.g., `todoList`) to storage.

## Full Store Definition Example

```ts
import { createChunk, combineAsync } from "mobx-chunk";
import { actions, type TActions } from "./actions";
import { asyncActions, type TAsyncActions } from "./asyncActions";
import { selectors, type TSelectors } from "./selectors";

export type Todo = {
  id: number;
  title: string;
  isComplete: boolean;
};

export type TState = {
  todoList: Todo[];
};

export const todoStore = createChunk<
  TState,
  TActions,
  TAsyncActions,
  TSelectors
>({
  name: "todo",
  initialState: {
    todoList: [],
  } satisfies TState,
  persist: ["todoList"],

  actions,
  asyncActions,
  views: selectors,
});

export type TTodoStore = typeof todoStore;
```

This setup generates:

* `todoStore.actions.setTodoList` & custom actions
* `todoStore.selectors.getTodoList` & custom views (selectors in example)
* `todoStore.asyncActions.asyncFunctionExample` & `asyncGeneratorExample`
* `todoStore.isLoading.asyncFunctionExample` & `asyncGeneratorExample`

## Defining Custom Actions

```ts
import type { TState, Todo } from "./chunk";

export function actions<Store extends TState>(store: Store) {
  return {
    addTodo(todo: Todo) {
      store.todoList = [...store.todoList, todo];
    },
    removeTodo(id: number) {
      store.todoList = store.todoList.filter(i => i.id !== id);
    },
  };
}
export type TActions = ReturnType<typeof actions>;
```

## Defining Custom Selectors (Views)

```ts
import type { Todo, TState } from "./chunk";

export function selectors<Store extends TState>(store: Store) {
  return {
    getCompletedTodo(): Todo[] {
      return store.todoList.filter(i => i.isComplete);
    },
  };
}
export type TSelectors = ReturnType<typeof selectors>;
```

## Defining Async Actions

```ts
import { runInAction } from "mobx-chunk";
import type { TState } from "./chunk";

export function asyncActions<Store extends TState>(store: Store) {
  return {
    async asyncFunctionExample() {
      await new Promise<void>(resolve =>
        setTimeout(() => {
          runInAction(() => {
            store.todoList = []; // simulate result
          });
          resolve();
        }, 7000)
      );
    },

    *asyncGeneratorExample() {
      yield new Promise<void>(resolve =>
        setTimeout(() => {
          store.todoList = []; // simulate result
          resolve();
        }, 7000)
      );
    },
  };
}
export type TAsyncActions = ReturnType<typeof asyncActions>;
```

### Or define async actions in separated files


```ts
import { combineAsync } from "mobx-chunk";
import type { TState } from "./chunk";

export const asyncGeneratorExample = (self: TState) => ({
  *asyncGeneratorExample(payload: { name: string }) {
    // code goes here
  },
})

export const asyncFunctionExample = (self: TState) => ({
  async asyncFunctionExample(payload: { namer: string }) {
    // code goes here
  },
})

export const asyncActions = combineAsync({ asyncGeneratorExample, asyncFunctionExample })
export type TAsyncActions = ReturnType<typeof asyncActions>
```

With `createChunk`, you get a fully-typed store slice, ready for both simple and complex state management patterns. Copy and adapt these examples to fit your application's needs!
