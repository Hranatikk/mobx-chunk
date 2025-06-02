---
sidebar_position: 4
---


# API: `withStore`

Higher-order component (HOC) for instantiating a local MobX chunk instance tied to a component's lifecycle. The store is created on mount and disposed on unmount, providing isolated state without prop drilling.

```ts
type StoreFactory<S> = S | (() => S)
function withStore<
  Props,
  Store
>(
  Component: React.ComponentType<Props>,
  storeOrFactory: StoreFactory<Store>
): React.FC<Props>
```

## Parameters

* `Component`: A React component that will consume the local store via hooks (`useValues`, `useComputed`, `useActions`).
* `storeFactory`: A function that returns a new chunk instance (e.g., a `createChunk` call) or an existing store factory function.

## Return Value

* A React functional component that wraps `Component`, providing its own store instance via internal context.

## Behavior

1. **Store Instantiation**: Calls `storeFactory()` when the wrapper mounts to create a new store instance.
2. **Context Provision**: Provides the store instance to all descendant hooks.
3. **Cleanup**: Disposes the store (and any persistence subscriptions) when the wrapper unmounts.

## Example

```tsx
import React from "react";
import { useValues, withStore } from "mobx-chunk";
import { createChunk } from "mobx-chunk";

// Define a chunk factory
const localStoreFactory = () =>
  createChunk({
    name: "local",
    initialState: { count: 0 },
  });

// Component that uses the local store
const Counter = () => {
  const { count } = useValues({
    count: () => localStoreFactory().selectors.getCount,
  });

  return <button onClick={() => localStoreFactory().actions.setCount(count + 1)}>{count}</button>;
};

// Wrap with HOC to bind a fresh store per mount
export default withStore(Counter, localStoreFactory);
```

Use `withStore` for any component that requires an isolated store instance, such as forms, wizards, or modals.
