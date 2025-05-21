# 🏷️ mobx-chunk

View online: https://hranatikk.github.io/mobx-chunk/docs/intro

Composable, type-safe MobX store factory and React hooks for easy state management.

---

## 📦 Installation

```bash
npm install mobx-chunk
# or
yarn add mobx-chunk
```

---

## 🚀 Quick Start

### 1. createChunk

```ts
import { createChunk } from 'mobx-chunk'
import { runInAction } from 'mobx'

const authStore = createChunk({
  name: 'auth',
  initialState: { token: '' },
  actions: self => ({
    logout() { self.token = '' },
  }),
  asyncActions: self => ({
    async login(user, pass) {
      const res = await fetch('/auth', { method: 'POST', body: JSON.stringify({ user, pass }) })
      const { token } = await res.json()
      runInAction(() => { self.token = token })
    }
  }),
  views: self => ({
    isLoggedIn: () => !!self.token
  }),
  persist: ['token']
})
```

### 2. Hooks

- **useValues**: subscribe to state/computed  
  ```ts
  const { token, isLoggedIn } = useValues({
    token: () => authStore.token,
  })
  ```
- **useActions**: extract methods  
  ```ts
  const { login, logout } = useActions(authStore)
  ```
- **useComputed**: observe MobX expressions  
  ```ts
  const loading = useComputed(() => authStore.isLoading.login)
  ```

### 3. withStore HOC

Wrap a component and instantiate store per lifecycle:

```tsx
import { withStore } from 'mobx-chunk'

function Dashboard() {
  return <div>{authStore.token}</div>
}

export default withStore(Dashboard, authStore)
```

---

## 💾 Persistence Engine

Configure once at app init:

```ts
import { configurePersistenceEngine } from 'mobx-chunk'

configurePersistenceEngine({
  get: (key) => /*…*/,
  remove: (key) => /*…*/,
  set: (key, value) => /*…*/,
  clear: () => /*…*/,
})
```

Chunks with `persist` fields hydrate on start and auto-save.

---

## ⚙️ Middleware

Register global interceptors:

```ts
import { addActionInterceptor } from 'mobx-chunk'

addActionInterceptor((ctx, next) => {
  // Your logic goes here
})
```

---

## 📄 License

MIT
