---
sidebar_position: 5
---

# Queries & Mutations

mobx-chunk includes a built-in data fetching layer — queries, mutations, and infinite queries — with per-argument caching, automatic loading/error tracking, and manual invalidation. Think of it as a simplified TanStack Query powered by MobX observables.

## Overview

Define queries directly in your chunk config alongside state, actions, and views:

```ts
import { createChunk } from "mobx-chunk";

const usersStore = createChunk({
  name: "users",
  initialState: { filter: "" },
  queries: (self) => ({
    fetchUsers: {
      fn: async (page: number) => api.getUsers(page, self.filter),
      type: "query" as const,
      cacheTime: 5000,
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

## Three Definition Types

### `query` — Cached GET requests

Each unique combination of arguments gets its own cache entry with a configurable `cacheTime` (default 30 seconds). Subsequent calls with the same arguments return cached data instantly.

```ts
fetchUsers: {
  fn: async (page: number) => api.getUsers(page),
  type: "query" as const,
  cacheTime: 10000, // 10 seconds
}
```

**Methods on `store.queries.fetchUsers`:**

| Method | Description |
|--------|-------------|
| `(...args)` | Returns cached data or fetches. Deduplicates concurrent calls with the same args. |
| `.getState(...args)` | Observable state for the given args: `data`, `error`, `status`, `isPending`, `isError`, `isSuccess`, `fetchedAt`. |
| `.refetch(...args)` | Force a fresh fetch, ignoring cache. |
| `.invalidate(...args)` | Remove cache entry for specific args. |
| `.invalidateAll()` | Clear entire cache for this query. |

### `mutation` — POST/PUT/DELETE (no cache)

Mutations don't cache — each call executes immediately. A single observable state tracks the last call.

```ts
createUser: {
  fn: async (name: string) => api.createUser(name),
  type: "mutation" as const,
}
```

**Methods on `store.queries.createUser`:**

| Method | Description |
|--------|-------------|
| `(...args)` | Execute the mutation, returns a Promise. |
| `.state` | Observable state of the last call: `data`, `error`, `status`, `isPending`, `isError`, `isSuccess`. |
| `.reset()` | Reset state back to `idle`. |

### `infiniteQuery` — Infinite scroll / load more

Accumulates data across pages. You provide an `initialPageParam` and a `getNextPageParam` function that extracts the next page parameter from the last response.

```ts
usersFeed: {
  fn: async (cursor: number) => api.getUsersFeed(cursor),
  type: "infiniteQuery" as const,
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
}
```

**Methods on `store.queries.usersFeed`:**

| Method | Description |
|--------|-------------|
| `()` | Fetch the first page (or return cache). |
| `.getState()` | Observable state: `pages[]`, `pageParams[]`, `hasNextPage`, `isFetchingNextPage`, `isPending`, `isError`. |
| `.fetchNextPage()` | Load the next page using `getNextPageParam` from the last response. |
| `.refetch()` | Clear all pages and reload from `initialPageParam`. |
| `.invalidate()` | Reset state to idle and clear pages. |

## Reading State

### In React — use hooks

```tsx
import { useQuery, useMutation, useInfiniteQuery } from "mobx-chunk";

function UsersList({ page }: { page: number }) {
  const { data, isPending, isError, error, refetch } = useQuery(
    usersStore.queries.fetchUsers, page
  );

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>Error: {String(error)}</p>;

  return (
    <ul>
      {data?.map((u) => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
```

See [`useQuery`](/docs/api/useQuery), [`useMutation`](/docs/api/useMutation), [`useInfiniteQuery`](/docs/api/useInfiniteQuery) API docs.

### In MobX code — use `getState`

Inside actions, views, or reactions, MobX automatically tracks observable access — no hook needed:

```ts
// In a computed view
views: (self) => ({
  isReady: () => !usersStore.queries.fetchUsers.getState(1).isPending,
})

// In a reaction
import { reaction } from "mobx";
reaction(
  () => usersStore.queries.fetchUsers.getState(page).data,
  (users) => console.log("Users updated:", users)
);
```

## Splitting Queries with `combineQueries`

When a chunk has many queries, split them into separate files and merge with `combineQueries`:

```ts
// queries/userQueries.ts
export const userQueries = (self) => ({
  fetchUsers: { fn: async (page: number) => api.getUsers(page), type: "query" as const },
  createUser: { fn: async (name: string) => api.createUser(name), type: "mutation" as const },
});

// queries/postQueries.ts
export const postQueries = (self) => ({
  fetchPosts: { fn: async (userId: number) => api.getPosts(userId), type: "query" as const },
});

// store.ts
import { createChunk, combineQueries } from "mobx-chunk";

const store = createChunk({
  name: "app",
  initialState: {},
  queries: combineQueries({ users: userQueries, posts: postQueries }),
});

// All queries available at one level
await store.queries.fetchUsers(1);
await store.queries.fetchPosts(42);
```

See [`combineQueries`](/docs/api/combineQueries) API docs.

## Lifecycle

All query caches live inside the chunk instance and are automatically cleaned up when you call `store.dispose()`.
