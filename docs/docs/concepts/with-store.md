---
sidebar_position: 5
---

# withStore HOC

Use the `withStore` higher-order component (HOC) to create a **local** MobX chunk instance for a specific component or screen. The local store is automatically created when the component mounts and disposed when it unmounts.

## When to Use

* **Isolated State**: For forms, modals, or any component needing its own transient store slice.
* **Automatic Cleanup**: Prevents memory leaks by disposing the store when the component no longer exists.

## Example Usage

```tsx
import React from "react";
import { useValues, withStore } from "mobx-chunk";
import { localStore } from "../store";

const Container = () => {
  const { localStoreValue, isLoading } = useValues({
    localStoreValue: () => localStore.selectors.getLocalStoreValue,
    isLoading: () => localStore.isLoading.localStoreAsyncFunc,
  });

  return (
    // Your UI goes here
    <></>
  );
};

export default withStore(Container, localStore);
```

## API

```ts
function withStore<ComponentProps, StoreType>(
  Component: React.ComponentType<ComponentProps>,
  storeFactory: () => StoreType
): React.FC<ComponentProps>;
```

* **Component**: The React component to wrap.
* **storeFactory**: A function (or existing store instance) creating the chunk.

The HOC:

1. Creates a new store instance on mount
2. Provides the store to hooks (`useValues`, `useActions`, `useComputed`) via context
3. Disposes the store instance on unmount

## How It Works

Internally, `withStore`:

* Wraps your component in a React provider context
* Calls `storeFactory()` to instantiate a store
* Cleans up by calling any disposal logic defined on the chunk (if available)

By using `withStore`, you ensure each component gets its own fresh store, with no prop drilling required.
