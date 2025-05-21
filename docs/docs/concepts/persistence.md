---
sidebar_position: 3
---

# Persistence

Configure automatic saving and rehydration of chunk state.

## Import

```ts
import { createChunk } from 'mobx-chunk'
```

## Example

```ts
const userChunk = createChunk({
  name: 'user',
  state: { token: '' },
  persistence: {
    key: 'user',
    version: 1,
  },
})
```