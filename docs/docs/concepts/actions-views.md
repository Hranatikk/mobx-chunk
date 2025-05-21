---
sidebar_position: 2
---

# Actions & Views

Define methods and derived values within a chunk.

## Actions

```ts
actions: {
  setName(name: string) {
    this.name = name
  },
},
```

## Views

```ts
views: {
  isNameExist() {
    return !!name
  },
},
```