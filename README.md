# 🏷️ mobx-chunk

Composable, type-safe MobX store factory and React hooks for easy state management in large apps.  

- **Factory** for creating “chunks” of state + actions + asyncFlows + computed views.  
- **Hooks**: `useValues`, `useActions`, `useComputed` for React+MobX integration.  
- **HOC**: `withStore` to inject a store into any component.  
- **Persistence**: pluggable engine, per-field reactive `isLoading` flags.  
- **Middleware**: interceptors for logging, error handling, etc.  

---

## 📦 Installation

```bash
# with npm
npm install mobx-chunk

# with yarn
yarn add mobx-chunk
```

---

## 🔨 Usage

### 1. `createChunk`: define a store

```ts
// src/stores/auth.ts
import { createChunk } from 'mobx-chunk'
import type { ChunkConfig } from 'mobx-chunk'

type AuthState = { token: string }
type SyncActions = {
  logout: () => void
}
type AsyncActions = {
  login: (username: string, password: string) => Promise<void>
}
type Views = {
  isLoggedIn: () => boolean
}

const config: ChunkConfig<AuthState, SyncActions, AsyncActions, Views> = {
  name: 'auth',
  initialState: { token: '' },
  actions: self => ({
    logout() {
      self.token = ''
    }
  }),
  asyncActions: self => ({
    async login(user, pass) {
      const res = await fetch('/auth', { method: 'POST', body: JSON.stringify({ user, pass }) })
      const { token } = await res.json()
      runInAction(() => { self.token = token })
    }
  }),
  views: self => ({
    isLoggedIn() {
      return !!self.token
    }
  }),
  persist: ['token']
}

export const authStore = createChunk(config)
export type AuthStore = typeof authStore
```

- **State**: plain object  
- **Sync actions**: arbitrary methods that mutate state  
- **Async actions**: generator (`flow`) or `async` functions with auto-`isLoading` flags  
- **Views**: computed getters  
- **Persist**: fields to save via your persistence engine  

---

### 2. React Hooks

#### `useValues`

Subscribe to multiple values (primitives or computed):

```tsx
import { useValues } from 'mobx-chunk'
import { authStore } from '../stores/auth'

export const Profile = () => {
  const { token, isLoggedIn } = useValues({
    token: () => authStore.token,
    isLoggedIn: () => authStore.isLoggedIn()
  })

  return <div>{isLoggedIn ? `Token: ${token}` : 'Not logged in'}</div>
}
```

#### `useActions`

Extract all store methods for easy invocation:

```tsx
import { useActions } from 'mobx-chunk'
import { authStore } from '../stores/auth'

export const LoginForm = () => {
  const { login, logout } = useActions(authStore)

  return (
    <>
      <button onClick={() => login('alice', 'secret')}>
        {authStore.isLoading.login ? 'Logging in…' : 'Login'}
      </button>
      <button onClick={logout}>Logout</button>
    </>
  )
}
```

#### `useComputed`

Observe computed values or any MobX expression:

```tsx
import { useComputed } from 'mobx-chunk'
import { authStore } from '../stores/auth'

export const Status = () => {
  const loading = useComputed(() => authStore.isLoading.login)
  const ready = useComputed(() => authStore.isLoggedIn())

  return (
    <div>
      {loading ? '…' : ready ? 'Welcome!' : 'Please log in.'}
    </div>
  )
}
```

---

### 3. `withStore` HOC

Wrap any component to provide a store instance:

```tsx
import React, { FC } from 'react'
import { withStore } from 'mobx-chunk'
import { authStore } from '../stores/auth'

const Dashboard: FC = () => {
  // authStore available globally / via hook
  return <div>Token: {authStore.token}</div>
}

export const DashboardWithStore = withStore(Dashboard, authStore)
```

---

## 💾 Persistence Engine

Plug in your own engine (AsyncStorage, localStorage, MMKV, etc.) once at app init:

```ts
import { configurePersistenceEngine } from 'mobx-chunk/persist'

const engine = {
  async get(key) { /*…*/ },
  async set(key, val) { /*…*/ },
  async remove(key) { /*…*/ },
  async clear(ns) { /*…*/ }
}

configurePersistenceEngine({ engine })
```

Each chunk with `persist: [...]` will automatically hydrate on creation and reactively save on changes.

---

## ⚙️ Middleware Interceptors

Log or transform actions globally:

```ts
import { addActionInterceptor } from 'mobx-chunk/middleware'

addActionInterceptor(({ chunkName, actionName, args }, next) => {
  console.debug(`[${chunkName}] ${actionName}`, args)
  return next()
})
```

---

## 📚 API Reference

- **`createChunk(config)`** → `StoreInstance`  
- **Hooks:**  
  - `useValues<G>(getters: G)`  
  - `useActions(store)`  
  - `useComputed(fn)`  
- **HOC:** `withStore(Component, storeOrFactory)`  
- **Persistence:**  
  - `configurePersistenceEngine({ engine })`  
  - chunk config `persist` + auto hydration & saving  
- **Middleware:** `addActionInterceptor`

---

## 🚀 Contributing

1. Fork & clone  
2. `yarn install`  
3. `yarn build` & `yarn test`  
4. PR with feature or bugfix  

---

## 📄 License

This project is licensed under the MIT License.
