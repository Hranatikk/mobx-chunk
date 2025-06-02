---
sidebar_position: 3
---

# API: `useComputed`

React hook for subscribing to a single MobX chunk-derived value or loading flag. Re-renders your component when the selected value changes.

```ts
function useComputed<Value>(
  selector: () => Value
): Value
```

## Parameters

* `selector`: A function returning the desired store value, loading flag, or any computed expression.

  * Typically references `store.selectors.getXyz` or `store.isLoading.someAsyncAction`.
  * Executed on render to subscribe, and again whenever the underlying observable changes.

## Return Value

* The current value of the selector:

```ts
const count = useComputed(() => counterStore.selectors.getCount);
// count: number
```

## Behavior

* Subscribes to the provided selector in one hook.
* Triggers a re-render when the selected value changes.
* Unsubscribes automatically when the component unmounts.

## Example

```tsx
import React from "react";
import { useComputed } from "mobx-chunk";
import { todoStore } from "./todo-store";

const TodoStats = () => {
  // Subscribe to the full list
  const todoList = useComputed(
    () => todoStore.selectors.getTodoList
  );

  // Subscribe to loading flag
  const isLoading = useComputed(
    () => todoStore.isLoading.fetchTodos
  );

  if (isLoading) {
    return <span>Loading...</span>;
  }

  return (
    <div>
      <p>Total todos: {todoList.length}</p>
      <p>Completed todos: {todoList.filter(t => t.isComplete).length}</p>
    </div>
  );
};

export default TodoStats;
```

Use `useComputed` when you need a single reactive value in your component without the overhead of batching multiple selectors.
