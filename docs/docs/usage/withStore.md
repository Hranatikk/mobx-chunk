---
sidebar_position: 1
---

# withStore

`withStore` creates a local store instance for a component lifecycle.

## Import

```ts
import { withStore } from 'mobx-chunk'
```

## Example

```tsx
const MyScreen = ({ store }) => {
  const { count } = useValues({ count: () => store.count })
  return <Text>{count}</Text>
}

export default withStore(MyScreen, () => createChunk({ name: 'local', state: { count: 0 }, actions: { increment() { this.count++ } } }))
```