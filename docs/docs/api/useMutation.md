---
sidebar_position: 9
---

# API: `useMutation`

React hook for subscribing to a MobX-powered mutation. Provides `mutate` (fire-and-forget) and `mutateAsync` (returns Promise), and re-renders when the mutation state changes.

```ts
function useMutation<TData, TArgs extends any[]>(
  mutation: MutationMethod<TData, TArgs>
): MutationResult<TData, TArgs>
```

## Parameters

* `mutation` — A `MutationMethod` from `store.queries.*` (a query defined with `type: "mutation"`).

## Return Value

Returns a `MutationResult<TData, TArgs>` object:

| Property | Type | Description |
|----------|------|-------------|
| `mutate` | `(...args: TArgs) => void` | Fire-and-forget — triggers the mutation without returning a Promise. |
| `mutateAsync` | `(...args: TArgs) => Promise<TData>` | Triggers the mutation and returns a Promise for `await`. |
| `data` | `TData \| undefined` | The data returned by the last successful mutation. |
| `error` | `unknown` | The error thrown by the last mutation, if any. |
| `isPending` | `boolean` | `true` while the mutation is in flight. |
| `isError` | `boolean` | `true` if the last mutation failed. |
| `isSuccess` | `boolean` | `true` if the last mutation succeeded. |
| `reset` | `() => void` | Reset state back to `idle` (clears `data` and `error`). |

## Behavior

* Does **not** auto-trigger on mount — you call `mutate()` or `mutateAsync()` explicitly.
* Subscribes to the observable mutation state via a MobX `reaction`.
* Re-renders the component when `data`, `error`, or `status` changes.
* `mutate` swallows errors; `mutateAsync` propagates them.
* Unsubscribes automatically on unmount.

## Examples

### Basic form

```tsx
import { useMutation } from "mobx-chunk";
import { usersStore } from "./store";

function CreateUserForm() {
  const [name, setName] = useState("");
  const { mutate, isPending, isSuccess, data, reset } = useMutation(
    usersStore.queries.createUser
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutate(name); }}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button disabled={isPending}>
        {isPending ? "Creating..." : "Create"}
      </button>

      {isSuccess && (
        <p>
          Created: {data?.name}
          <button type="button" onClick={reset}>Dismiss</button>
        </p>
      )}
    </form>
  );
}
```

### With async/await

```tsx
const { mutateAsync, isPending } = useMutation(usersStore.queries.createUser);

const handleCreate = async () => {
  try {
    const user = await mutateAsync("Alice");
    console.log("Created:", user);
  } catch (err) {
    console.error("Failed:", err);
  }
};
```
