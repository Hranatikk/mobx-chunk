---
sidebar_position: 2
---

# Storage Adapter

Configure custom storage for persistence.

## Import

```ts
import { configurePersistenceEngine } from 'mobx-chunk'
```

## Example

```ts
import { MMKV } from "react-native-mmkv"

import { MMKV } from "react-native-mmkv"

const storage = new MMKV() // OR use sync localstorage 

configurePersistenceEngine({
  get: (key) => storage.getString(key),
  remove: (key) => storage.delete(key),
  set: (key, value) => storage.set(key, value),
})
```