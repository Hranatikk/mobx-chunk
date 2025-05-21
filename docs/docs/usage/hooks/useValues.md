---
sidebar_position: 3
---

# useValues

Subscribe to chunk values.

## Import

```ts
import { useValues } from 'mobx-chunk'
```

## Example

```ts
const { token, isLoggedIn } = useValues({
  token: () => authStore.token,
})
```