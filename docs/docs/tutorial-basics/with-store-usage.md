---
sidebar_position: 3
---

# withStore usage

`withStore` is the higher-order component (HOC) that gives a **local, self-contained store** to an individual React component. A new store instance is created on mount and disposed of automatically on unmount—no manual housekeeping required.

---

## How it works
1. **Factory call** – You pass a *chunk* definition (or an already created chunk) to `withStore`.  
2. **Mount** – When the wrapped component mounts, `withStore` instantiates the chunk and places it in a React context that only this component subtree can access.  
3. **Render** – The HOC injects `values` and `actions` props (or any custom selector you configure) into your component so it can read and mutate its private state.  
4. **Unmount** – As soon as the component unmounts, the store is dropped; observers are cleaned up and memory is freed.

---

## When to use it
- **Class components** or third-party widgets that can’t use hooks.  
- **Isolated state** that should live and die with a single UI instance (e.g. wizards, modals, item editors).  
- **Avoiding global pollution** when the data is relevant only to one part of the tree.

---

## Example of usage
```
import { withStore } from "mobx-chunk"
import { store } from "./store"

export const YourComponent {

  return {
    // your view goes here
  }
}
export default withStore(YourComponent, store)

```

---

## Lifecycle & disposal
| Phase | Behaviour |
|-------|-----------|
| **Mount** | Store is created, observers register. |
| **Update** | If `mapProps` changes derived values, `runInAction` applies them atomically. |
| **Unmount** | Store is destroyed, reactions disposed, memory freed. |

> Because each store instance is short-lived and scoped, you can safely create many independent components without worrying about leaks.

---

## Best practices
- Keep local stores small—don’t replicate large global slices.  
- If you need persistence, wire it through the chunk itself, *not* the HOC, so disposal logic remains predictable.

`withStore` offers the convenience of fully isolated state without sacrificing MobX reactivity—perfect for one-off UI islands and legacy components alike.
