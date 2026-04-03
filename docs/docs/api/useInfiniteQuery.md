---
sidebar_position: 8
---

# API: `useInfiniteQuery`

React hook for subscribing to a MobX-powered infinite query. Loads the first page on mount, provides `fetchNextPage` for pagination, and re-renders on state changes.

```ts
function useInfiniteQuery<TData, TPageParam>(
  query: InfiniteQueryMethod<TData, TPageParam>,
  options?: UseInfiniteQueryOptions
): InfiniteQueryResult<TData, TPageParam>
```

## Parameters

* `query` — An `InfiniteQueryMethod` from `store.queries.*` (a query defined with `type: "infiniteQuery"`).
* `options` (optional) — Configuration object.

### `UseInfiniteQueryOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | When `false`, the first page will not auto-fetch on mount. |

## Return Value

Returns an `InfiniteQueryResult<TData, TPageParam>` object:

| Property | Type | Description |
|----------|------|-------------|
| `data` | `{ pages: TData[]; pageParams: TPageParam[] } \| undefined` | All loaded pages and their params. `undefined` until the first page loads. |
| `error` | `unknown` | The error thrown by the query, if any. |
| `isPending` | `boolean` | `true` while loading the first page. |
| `isError` | `boolean` | `true` if the query failed. |
| `isSuccess` | `boolean` | `true` if at least one page was fetched successfully. |
| `hasNextPage` | `boolean` | `true` if `getNextPageParam` returned a value (not `undefined`). |
| `isFetchingNextPage` | `boolean` | `true` while loading a subsequent page via `fetchNextPage`. |
| `fetchNextPage` | `() => Promise<void>` | Load the next page. No-op if `hasNextPage` is `false`. |
| `refetch` | `() => Promise<void>` | Clear all pages and reload from `initialPageParam`. |

## Behavior

* On mount, loads the first page by calling `query()`.
* Subscribes to the observable infinite query state via a MobX `reaction`.
* When `fetchNextPage` is called, appends the next page to `data.pages`.
* `hasNextPage` is derived from `getNextPageParam(lastPage)` — if it returns `undefined`, there are no more pages.
* Unsubscribes automatically on unmount.

## Example

```tsx
import { useInfiniteQuery } from "mobx-chunk";
import { usersStore } from "./store";

function UsersFeed() {
  const {
    data,
    isPending,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery(usersStore.queries.usersFeed);

  if (isPending) return <p>Loading feed...</p>;
  if (isError) return <p>Error: {String(error)}</p>;

  const allUsers = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div>
      <ul>
        {allUsers.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </button>
      )}

      {!hasNextPage && <p>No more items.</p>}

      <button onClick={() => refetch()}>Refresh all</button>
    </div>
  );
}
```
