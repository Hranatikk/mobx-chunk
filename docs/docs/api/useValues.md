---
sidebar_position: 2
---

# API: `useValues`

React hook for batch-subscribing to multiple MobX chunk-derived values in one call. Re-renders your component when any selected value changes.

```ts
function useValues<Selectors extends Record<string, (() => any) | any>>(
  getters: Selectors
): { [K in keyof Selectors]: Selectors[K] extends () => infer R ? R : Selectors[K] }
```

## Parameters

* `selectors`: An object whose keys are local variable names and values are functions returning the desired store value or loading flag.

  * Each function should return a value from `store.selectors`, `store.isLoading`, or any computed expression.
  * Executed once on render to subscribe, and again whenever the underlying observable changes.

## Return Value

An object mapping the same keys as the `selectors` input to the current values:

```ts
const values = useValues({
  foo: () => store.selectors.getFoo,
  bar: () => store.isLoading.fetchData,
});
// values: { foo: string; bar: boolean }
```

## Behavior

* Subscribes to all provided selectors in a single hook.
* Batches updates: your component will re-render once even if multiple values change.
* Unsubscribes automatically on unmount.

## Example

```tsx
import React from "react";
import { useValues } from "mobx-chunk";
import { todoStore } from "./todo-store";

const TodoList = () => {
  const { todos, loading } = useValues({
    todos: () => todoStore.selectors.getTodoList,
    loading: () => todoStore.isLoading.fetchTodos,
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
};
```

Use `useValues` when you need multiple reactive values in a component without separate hook calls for each.
