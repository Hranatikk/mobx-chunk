# mobx-chunk

[![npm version](https://img.shields.io/npm/v/mobx-chunk.svg)](https://www.npmjs.com/package/mobx-chunk) [![Downloads](https://img.shields.io/npm/dm/mobx-chunk.svg)](https://www.npmjs.com/package/mobx-chunk)

A lightweight, type-safe factory for building MobX-powered state slices ("chunks") with auto-generated actions, selectors, async flows, loading flags, and optional persistence.

[Full Documentation](https://hranatikk.github.io/mobx-chunk/)

## Features

* **Automatic Actions & Selectors**: Generates `set${ValueKey}` actions and `get${ValueKey}` selectors for each state field.
* **Async Actions & Loading Flags**: Define asynchronous flows with `store.asyncActions` and track them via `store.isLoading` flags.
* **Type Safety**: Fully typed stores, actions, and selectors using TypeScript inference.
* **Persistence**: Plug in any storage engine (MMKV, AsyncStorage, localStorage) to persist specific fields.
* **React Integration**: React hooks (`useValues`, `useComputed`, `useChunk`) for seamless UI updates.

## Installation

```bash
# with npm
npm install mobx-chunk

# with yarn
yarn add mobx-chunk
```

## Quick Start

### Basic Example

```ts
// store.ts
import { createChunk } from "mobx-chunk";

export type TState = { accessToken: string };
export const store = createChunk<TState>({
  name: "store",
  initialState: { accessToken: "" } satisfies TState,
  persist: ["accessToken"],
});

// App.tsx
import React from "react";
import { View, Text } from "react-native";
import { useValues } from "mobx-chunk";
import { store } from "./store";

export default function App() {
  const { accessToken } = useValues({
    accessToken: () => store.selectors.getAccessToken,
  });

  return (
    <View>
      <Text>{accessToken}</Text>
    </View>
  );
}
```

## Create a Chunk

Define a chunk with custom actions, async flows, and views:

```ts
import { createChunk } from "mobx-chunk";
import { actions, type TActions } from "./actions";
import { asyncActions, type TAsyncActions } from "./asyncActions";
import { selectors, type TSelectors } from "./selectors";

export type Todo = { id: number; title: string; isComplete: boolean };
export type TState = { todoList: Todo[] };

export const todoStore = createChunk<
  TState,
  TActions,
  TAsyncActions,
  TSelectors
>({
  name: "todo",
  initialState: { todoList: [] } satisfies TState,
  persist: ["todoList"],
  actions,
  asyncActions,
  views: selectors,
});
```

## Subscribe to Changes

Use React hooks to reactively subscribe:

```tsx
import { useValues, useComputed } from "mobx-chunk";
import { todoStore } from "./todo-store";

// Batch subscription
const { todoList, isLoading } = useValues({
  todoList: () => todoStore.selectors.getTodoList,
  isLoading: () => todoStore.isLoading.asyncFunctionExample,
});

// Single subscription
const singleList = useComputed(
  () => todoStore.selectors.getTodoList
);
```

## Persistence Setup

Configure a storage engine in your app entrypoint:

```ts
import { configurePersistenceEngine } from "mobx-chunk";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV();
configurePersistenceEngine({
  clear: () => storage.clearAll(),
  get:    (key) => storage.getString(key),
  remove: (key) => storage.delete(key),
  set:    (key, value) => storage.set(key, value),
});
```

Supports synchronous or asynchronous APIs (e.g., AsyncStorage or browser localStorage).

## Middleware (Interceptors)

Add global interceptors for validation, logging, or metrics:

```ts
import { addActionInterceptor } from "mobx-chunk";

addActionInterceptor((ctx, next) => {
  // ctx.chunkName, ctx.actionName, ctx.args
  if (ctx.actionName === "yourAction") {
    // validate or log
  }
  return next();
});
```

> **Coming Soon:** Separate interceptors for general actions, async actions, and sync actions.

## License

This project is licensed under the MIT License.
