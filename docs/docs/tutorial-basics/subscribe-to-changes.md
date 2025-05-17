---
sidebar_position: 2
---

# Subscribe to changes

Track updates effortlessly—**mobx-chunk** turns each store into an observable source that your components re-render from automatically.

## Overview
Reactivity is built in. Choose from purpose-built React hooks to stay in sync with your data while keeping components lean.

---

## React hooks

### `useValues`
Pick any state or computed fields; the component re-renders only when those values actually change.

```
// Inside React component 

import { useValues } from "mobx-chunk"

const { bar, baz } = useValues({
  bar: () => barStore.bar,
  baz: () => bazStore.baz,
})
```

### `useComputed`
Pass a custom selector to derive a memoised value on demand—perfect for ad-hoc calculations without polluting the store definition.

```
// Inside React component 

import { useComputed } from "mobx-chunk"

const token = useComputed(() => authStore.token)
```

### `isLoading` flags
Every async flow automatically exposes an `isLoading.<flowName>` boolean.  
Subscribe via `useValues()` (e.g. `const { isLoading } = useValues()`) to toggle spinners, disable buttons, or display skeleton screens with zero extra code.

```
// Inside React component 

import { useComputed } from "mobx-chunk"

const isLoading = useComputed(() => authStore.isLoading.yourAsyncFunctionName)
```

---

## Best practices
- Select only the pieces of state you need; finer-grained selection means fewer renders.  
- Use `useComputed` for one-off selectors rather than adding extra computed fields to the store.  
- Bind UI loading states directly to `isLoading` flags instead of manual state toggles.  
- Keep side effects in flows or middleware; aim for declarative UI components.
