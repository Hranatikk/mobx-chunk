---
sidebar_position: 10
---

# API: `combineQueries`

Utility for merging multiple query builder functions into a single builder. Works identically to `combineAsync` but for query/mutation/infinite query definitions.

```ts
function combineQueries<
  T extends Record<string, (self: any) => Record<string, AnyQueryDefinition>>
>(
  factories: T
): (self: any) => CombinedQueries<T>
```

## Parameters

* `factories` (`T`) — An object whose values are builder functions. Each builder receives `self` (the store instance) and returns an object of query definitions (`QueryDefinition`, `MutationDefinition`, or `InfiniteQueryDefinition`).

## Return Value

* Returns a single builder function `(self: any) => CombinedQueries<T>` that merges all definitions into one flat object. Pass this as the `queries` option of `createChunk`.

## Behavior

* Iterates over all builders in `factories`.
* Calls each builder with `self` to retrieve its query definitions.
* Merges all definitions into a single flat object.
* If two builders define the same key, the last one wins (standard `Object.assign` behavior).

## Example

```ts
// queries/userQueries.ts
export const userQueries = (self: any) => ({
  fetchUsers: {
    fn: async (page: number) => api.getUsers(page),
    type: "query" as const,
    cacheTime: 5000,
  },
  createUser: {
    fn: async (name: string) => api.createUser(name),
    type: "mutation" as const,
  },
});

// queries/postQueries.ts
export const postQueries = (self: any) => ({
  fetchPosts: {
    fn: async (userId: number) => api.getPosts(userId),
    type: "query" as const,
  },
  createPost: {
    fn: async (userId: number, title: string) => api.createPost(userId, title),
    type: "mutation" as const,
  },
});

// store.ts
import { createChunk, combineQueries } from "mobx-chunk";
import { userQueries } from "./queries/userQueries";
import { postQueries } from "./queries/postQueries";

const store = createChunk({
  name: "app",
  initialState: {},
  queries: combineQueries({
    users: userQueries,
    posts: postQueries,
  }),
});

// All queries on one level
await store.queries.fetchUsers(1);
await store.queries.createPost(1, "Hello");
store.queries.fetchPosts.getState(42); // observable state
```

Use `combineQueries` to keep large chunks organized by splitting query definitions across files without nesting.
