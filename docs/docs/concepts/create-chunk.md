---
sidebar_position: 1
---

# Create Chunk

`createChunk` is the core factory function of MobX-Chunk. It bundles together state, actions, computed values, middleware, and persistence into a single store instance.

## Import

```ts
import { createChunk } from 'mobx-chunk'
```

## Usage

```ts
const counterChunk = createChunk({
  name: 'counter',
  state: { value: 0 },
  actions: {
    increment() {
      this.value += 1
    },
  },
})
```