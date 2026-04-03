---
sidebar_position: 7
---

# API: `useQuery`

React hook for subscribing to a MobX-powered query. Auto-fetches on mount (unless disabled), subscribes to observable state, and re-renders the component when data, error, or status changes.

```ts
function useQuery<TData, TArgs extends any[]>(
  query: QueryMethod<TData, TArgs>,
  ...args: [...TArgs] | [...TArgs, UseQueryOptions]
): QueryResult<TData>
```

## Parameters

* `query` — A `QueryMethod` from `store.queries.*` (a query defined with `type: "query"`).
* `...args` — Arguments to pass to the query function. Optionally, the last argument can be a `UseQueryOptions` object.

### `UseQueryOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | When `false`, the query will not auto-fetch on mount. Useful for conditional queries. |

## Return Value

Returns a `QueryResult<TData>` object:

| Property | Type | Description |
|----------|------|-------------|
| `data` | `TData \| undefined` | The cached or fetched data. |
| `error` | `unknown` | The error thrown by the query, if any. |
| `isPending` | `boolean` | `true` while the query is in flight. |
| `isError` | `boolean` | `true` if the query failed. |
| `isSuccess` | `boolean` | `true` if data was fetched successfully. |
| `refetch` | `() => Promise<TData>` | Force a fresh fetch, ignoring cache. |

## Behavior

* On mount, calls `query(...args)` which returns cached data (if fresh) or fetches.
* Subscribes to the observable query state via a MobX `reaction`.
* Re-renders the component when `data`, `error`, or `status` changes.
* When `args` change, re-subscribes to the new cache entry and triggers a new fetch if needed.
* Unsubscribes automatically on unmount.

## Examples

### Basic usage

```tsx
import { useQuery } from "mobx-chunk";
import { usersStore } from "./store";

function UsersList({ page }: { page: number }) {
  const { data, isPending, isError, error, refetch } = useQuery(
    usersStore.queries.fetchUsers, page
  );

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>Error: {String(error)}</p>;

  return (
    <div>
      <ul>
        {data?.map((u) => <li key={u.id}>{u.name}</li>)}
      </ul>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### Conditional query with `enabled`

```tsx
function UserProfile({ userId }: { userId: number | null }) {
  const { data, isPending } = useQuery(
    usersStore.queries.fetchUserById,
    userId ?? 0,
    { enabled: userId !== null }
  );

  if (!userId) return <p>Select a user</p>;
  if (isPending) return <p>Loading...</p>;

  return <p>{data?.name}</p>;
}
```

### No arguments

```tsx
const { data } = useQuery(configStore.queries.fetchConfig);
```
