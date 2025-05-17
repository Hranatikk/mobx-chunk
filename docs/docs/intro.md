---
sidebar_position: 1
---

# Introduction

**Full-featured reactive state management — zero boilerplate, maximum focus on product**

### What is *mobx-chunk*?

*moxb-chunk* is a **batteries-included** factory that transforms a plain-English description of a store into a production-ready MobX slice.  
It ships with everything you need out of the box and has only **MobX** as a peer dependency.

It gives you:

- **Centralized, encapsulated stores** – each *chunk* is an independent slice that plugs in or out without touching the rest of your codebase.  
- **Mutable *and* safe data** – every action runs atomically inside `runInAction`, so state can be modified freely while remaining internally consistent.  
- **Automatic loading flags & async flows** – every async method gets its own `isLoading.<flow>` flag and can be written in generator style *or* `async/await`.  
- **Side-effect management built in** – middleware interceptors let you react to any action/flow without scattering `useEffect` calls across components.  
- **Pluggable persistence** – swap in MMKV, IndexedDB, secure storage, or anything else via the adapter interface.  
- **First-class React hooks & HOC** – `useValues`, `useActions`, `useComputed`, and `withStore` cover 90 % of UI-binding scenarios.  
- **Serializable snapshots & time-travel-ready** – because state is plain data, you can snapshot, replay, or hydrate at will.  
- **Friendly community & clear roadmap** – join us on GitHub; help shape upcoming DevTools, SSR helpers, and more!  

> **Powerful when you need it, invisible when you don’t — mobx-chunk lets you build features, not plumbing.**


## Getting Started

Kick off in minutes—add **mobx-chunk** to your project and start shipping features instead of boilerplate.

### What you’ll need
- **React** ≥ 18
- **MobX** ≥ 6

That’s it—no extra build tools or runtime libraries required.

### Install
```sh
# npm
npm install mobx-chunk

# yarn
yarn add mobx-chunk
```

### Basic example

```
import { createChunk, useComputed } from "mobx-chunk"

// Define default state

export type TState = {
  token: string
}
export const authStore = createChunk({
  initialState: {
    token: "",
  } satisfies TState,
  name: "authStore",

  actions: (store: TState) => {
    return {
      actionExample() {
        store.token = String(Date.now())
      },
    }
  },
  views: (store: TState) => {
    return {
      isAuthenticated() {
        return Boolean(store.token)
      },
    }
  },
})

// Listening to updates in Component with hook
const token = useComputed(() => authStore.token)

```
