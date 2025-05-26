---
sidebar_position: 2
---

# Subscribe to Changes

**mobx-chunk** provides easy-to-use React hooks to reactively subscribe to store changes and keep your components in sync.

## Hooks Overview

* **`useValues`**: Subscribe to multiple store-derived values in one call. Triggers re-render when any selected value changes.
* **`useComputed`**: Subscribe to a single derived value. Ideal for isolated pieces of state or complex selectors.

## Example Usage

```tsx
import React from "react";
import { useValues, useComputed } from "mobx-chunk";
import { todoStore } from "./todo-store-path";

const Component = () => {
  // Subscribe to multiple values at once
  const { todoList, isLoading } = useValues({
    todoList: () => todoStore.selectors.getTodoList,
    isLoading: () => todoStore.isLoading.asyncFunctionExample,
  });

  // Subscribe to individual values separately
  const singleTodoList = useComputed(
    () => todoStore.selectors.getTodoList
  );
  const singleLoadingFlag = useComputed(
    () => todoStore.isLoading.asyncFunctionExample
  );

  // Invoke an async action and await completion
  const handleCallAsyncFunction = async () => {
    await todoStore.asyncActions.asyncFunctionExample();
  };

  // Invoke a custom synchronous action
  const handleCallCustomAction = () => {
    todoStore.actions.addNewPost({
      id: Date.now(),
      title: 'Title example',
      isComplete: false,
    });
  };

  // Access store values outside React components
  const handleGetValue = () => {
    console.log(todoStore.selectors.getCompletedTodo());
  };

  return (
    // Your UI goes here
    <></>
  );
};

export default Component;
```

## Details

* **Batch subscriptions (`useValues`)**

  * Pass an object whose keys will map to local variables.
  * Each field is a function returning a selector or loading flag.
  * The hook returns an object with current values.

* **Single subscriptions (`useComputed`)**

  * Pass a function returning the selector or flag.
  * Returns the current value directly.

* **Async Actions**

  * Available under `store.asyncActions`.
  * Returns a promise; use `await` in handlers.
  * Loading flags auto-update under `store.isLoading`.

* **Actions**

  * Available under `store.actions`.
  * Invoke directly to update state synchronously.

* **Outside React**

  * Call `store.selectors`, `store.actions`, or `store.asyncActions` anywhere.
  * Useful for logging, timers, or non-UI logic.
