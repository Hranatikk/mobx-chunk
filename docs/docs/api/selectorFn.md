---
sidebar_position: 9
---

# API: `selectorFn`

Marks a view function as a parameterized method so it is **not** treated as a computed getter.

```ts
function selectorFn<F extends (...args: any[]) => any>(fn: F): F
```

## Why it's needed

By default, `views` functions with zero declared parameters (`fn.length === 0`) are treated as computed getters — they are accessed as properties rather than called as methods.

However, some functions report `fn.length === 0` even though they accept arguments:

* Functions using **default parameters**: `(page = 1) => ...`
* Functions using **rest parameters**: `(...tags: string[]) => ...`
* Functions using **destructuring**: `({ page, limit } = {}) => ...`

Wrapping such functions with `selectorFn` tells mobx-chunk to treat them as callable methods instead of computed getters.

## Parameters

* `fn`: The view function to mark as a method.

## Return Value

Returns the same function `fn`, with an internal marker attached.

## Example

```ts
import { createChunk, selectorFn } from "mobx-chunk";

type Item = { id: string; tag: string; title: string };
type TState = { items: Item[] };

export const itemStore = createChunk<
  TState,
  {},
  {},
  { filteredItems: (...tags: string[]) => Item[] }
>({
  name: "item",
  initialState: { items: [] },
  views: (self) => ({
    filteredItems: selectorFn((...tags: string[]) =>
      self.items.filter((i) => tags.includes(i.tag))
    ),
  }),
});

// Usage — called as a method, not accessed as a property
const result = itemStore.selectors.filteredItems("work", "personal");
```

## Without `selectorFn`

Without the wrapper, the function above would be treated as a computed getter because `(...tags).length === 0`. This would cause it to be accessed as a property and called with no arguments, leading to incorrect behavior.
