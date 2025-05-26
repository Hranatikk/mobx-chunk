---
sidebar_position: 3
---

# Persistence Setup

To persist store fields across sessions, **mobx-chunk** lets you plug in any storage engine via `configurePersistenceEngine`. Below are examples for React Native (MMKV, AsyncStorage) and web (localStorage).

## configurePersistenceEngine

Before using any persisted chunks, initialize the persistence engine once in your app’s entry point:

```ts
import { configurePersistenceEngine } from "mobx-chunk";

configurePersistenceEngine({
  clear: () => {/* remove all keys */},
  get:   (key: string) => /* return string | Promise<string | null> */,
  remove:(key: string) => /* remove one key */,
  set:   (key: string, value: string) => /* set one key */,
});
```

* **clear(key?)**: Remove all or scoped entries.
* **get(key)**: Return the stored string or a promise resolving to it.
* **remove(key)**: Delete a specific key.
* **set(key, value)**: Store a string value.

## React Native: MMKV Example

```ts
import React from "react";
import { MMKV } from "react-native-mmkv";
import { configurePersistenceEngine } from "mobx-chunk";

const storage = new MMKV();

configurePersistenceEngine({
  clear: () => storage.clearAll(),
  get:    (key) => storage.getString(key),
  remove: (key) => storage.delete(key),
  set:    (key, value) => storage.set(key, value),
});

const App = () => (
  // Your app goes here
  <></>
);

export default App;
```

## React Native: AsyncStorage Example

```ts
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { configurePersistenceEngine } from "mobx-chunk";

configurePersistenceEngine({
  clear:  () => AsyncStorage.clear(),
  get:    (key) => AsyncStorage.getItem(key),
  remove: (key) => AsyncStorage.removeItem(key),
  set:    (key, value) => AsyncStorage.setItem(key, value),
});

const App = () => (
  // Your app goes here
  <></>
);

export default App;
```

## React (Web): `localStorage` Example

```tsx
import React from "react";
import { configurePersistenceEngine } from "mobx-chunk";

configurePersistenceEngine({
  clear:  () => Promise.resolve(localStorage.clear()),
  get:    (key) => Promise.resolve(localStorage.getItem(key)),
  remove: (key) => Promise.resolve(localStorage.removeItem(key)),
  set:    (key, value) => Promise.resolve(localStorage.setItem(key, value)),
});

const App = () => (
  // Your app goes here
  <></>
);

export default App;
```

With the engine configured, any chunk using the `persist` option will automatically read and write state to your chosen storage backend.
