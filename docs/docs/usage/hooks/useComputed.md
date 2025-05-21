---
sidebar_position: 2
---

# useComputed

Subscribe to computed values.

## Import

```ts
import { useComputed } from 'mobx-chunk'
```

## Example

```ts
const authStoreVar = useComputed(() => authStore.authStoreVar)
const isLoading = useComputed(() => authStore.isLoading.asyncFunc)
```