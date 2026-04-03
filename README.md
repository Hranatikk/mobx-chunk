# mobx-chunk

[![npm version](https://img.shields.io/npm/v/mobx-chunk.svg)](https://www.npmjs.com/package/mobx-chunk) [![Downloads](https://img.shields.io/npm/dm/mobx-chunk.svg)](https://www.npmjs.com/package/mobx-chunk)

A lightweight, type-safe factory for building MobX-powered state slices ("chunks") with auto-generated actions, selectors, async flows, loading flags, and optional persistence.

[Full Documentation](https://hranatikk.github.io/mobx-chunk/)

## Features

* **Automatic Actions & Selectors**: Generates `set${ValueKey}` actions and `get${ValueKey}` selectors for each state field.
* **Async Actions & Loading Flags**: Define asynchronous flows with `store.asyncActions` and track them via `store.isLoading` flags.
* **Queries & Mutations**: Built-in data fetching with per-argument caching, loading states, infinite pagination, and manual invalidation — similar to TanStack Query but powered by MobX.
* **Type Safety**: Fully typed stores, actions, and selectors using TypeScript inference.
* **Persistence**: Plug in any storage engine (MMKV, AsyncStorage, localStorage) to persist specific fields.
* **React Integration**: React hooks (`useValues`, `useComputed`, `useChunk`, `useQuery`, `useInfiniteQuery`, `useMutation`) for seamless UI updates.

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

## Queries & Mutations

Define queries, mutations, and infinite queries directly in your chunk config. Each query caches results per arguments, tracks loading/error state, and supports manual invalidation.

### Define Queries

```ts
import { createChunk } from "mobx-chunk";

const usersStore = createChunk({
  name: "users",
  initialState: {},
  queries: (self) => ({
    fetchUsers: {
      fn: async (page: number) => api.getUsers(page),
      type: "query" as const,
      cacheTime: 5000, // ms, default 30000
    },
    createUser: {
      fn: async (name: string) => api.createUser(name),
      type: "mutation" as const,
    },
    usersFeed: {
      fn: async (cursor: number) => api.getUsersFeed(cursor),
      type: "infiniteQuery" as const,
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  }),
});
```

### Use in React

```tsx
import { useQuery, useMutation, useInfiniteQuery } from "mobx-chunk";

// Paginated list — auto-fetches, caches per page
const { data, isPending, refetch } = useQuery(usersStore.queries.fetchUsers, 1);

// Mutation with loading state
const { mutate, isPending } = useMutation(usersStore.queries.createUser);
mutate("Alice");

// Infinite scroll
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
  usersStore.queries.usersFeed
);
```

### Read State Without a Hook

Inside MobX actions, views, or reactions — no hook needed:

```ts
const state = usersStore.queries.fetchUsers.getState(1);
// state.data, state.isPending, state.isError, state.error, state.status

const mutationState = usersStore.queries.createUser.state;
// mutationState.data, mutationState.isPending
```

### Split Queries Across Files

Use `combineQueries` (like `combineAsync`) when a chunk has many queries:

```ts
import { createChunk, combineQueries } from "mobx-chunk";
import { userQueries } from "./queries/userQueries";
import { postQueries } from "./queries/postQueries";

const store = createChunk({
  name: "app",
  initialState: {},
  queries: combineQueries({ users: userQueries, posts: postQueries }),
});

// All queries available at one level
await store.queries.fetchUsers(1);
await store.queries.createPost(1, "Hello");
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
import { addActionInterceptor, removeActionInterceptor } from "mobx-chunk";

const logger = (ctx, next) => {
  console.log(`[${ctx.chunkName}] ${ctx.actionName}`, ctx.args);
  return next();
};

// Register
addActionInterceptor(logger);

// Unregister when no longer needed
removeActionInterceptor(logger);
```

> **Coming Soon:** Separate interceptors for general actions, async actions, and sync actions.

## `selectorFn`

Mark view functions as parameterized methods when they use rest/default params (which report `fn.length === 0`):

```ts
import { createChunk, selectorFn } from "mobx-chunk";

const store = createChunk({
  name: "items",
  initialState: { items: [] },
  views: (self) => ({
    filteredItems: selectorFn((...tags: string[]) =>
      self.items.filter((i) => tags.includes(i.tag))
    ),
  }),
});
```

## License

This project is licensed under the MIT License.
