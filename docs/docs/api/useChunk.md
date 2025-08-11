---
sidebar_position: 2
---

# API: `useChunk`

React hook for creating and managing a **local MobX chunk store instance** for the lifetime of a component.
Automatically disposes the store when the component unmounts.

```ts
function useChunk<State, Actions, AsyncActions, Selectors>(
  config: ChunkConfig<State, Actions, AsyncActions, Selectors>,
  options?: UseChunkOptions
): StoreInstance<State, Actions, AsyncActions, Selectors> & {
  dispose?: () => void
  persistNow?: () => void
}
```

## Parameters

* `config`: A `ChunkConfig` object describing initial state, actions, async actions, selectors, and persistence options for the store.

* `options` *(optional)*:

  * `flushOnUnmount?: boolean` — If `true` (default), calls `store.persistNow()` before disposing, ensuring the latest state is saved.
  * `onInit?: (store) => void` — Callback invoked once, right after the store is created.
  * `onDispose?: (store) => void` — Callback invoked right before the store is disposed.

## Return Value

* The newly created store instance with all state, actions, async actions, selectors, and utility methods (`dispose`, optionally `persistNow`).

```ts
const store = useChunk(config)
// store.actions, store.asyncActions, store.selectors...
```

## Behavior

* **One instance per mount** — the store is created when the component mounts, and disposed when it unmounts.
* **Automatic cleanup** — no need to manually call `dispose()` in your components; `useChunk` does it for you.
* **Optional flush** — `flushOnUnmount` ensures the latest state is persisted before disposing.

## Example

```tsx
import React from "react";
import { useChunk, useValues } from "mobx-chunk";
import { taskConfig } from "./task-config";

const TaskScreen = () => {
  // Create a store instance for this screen
  const store = useChunk(taskConfig, { flushOnUnmount: true });

  // Subscribe to state values
  const { tasks, isLoading } = useValues({
    tasks: () => store.selectors.getTaskList,
    isLoading: () => store.isLoading.fetchTasks
  });

  React.useEffect(() => {
    store.asyncActions.fetchTasks();
  }, [store]);

  if (isLoading) {
    return <span>Loading...</span>;
  }

  return (
    <div>
      {tasks.map(task => (
        <p key={task.id}>{task.title}</p>
      ))}
    </div>
  );
};

export default TaskScreen;
```

## When to use

* Use `useChunk` for **screen-level or component-level stores** that should not persist beyond the component’s lifetime.
* For **global stores** (app-wide state), create them once in a module and export the instance without using `useChunk`.
