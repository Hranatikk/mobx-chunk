---
sidebar_position: 4
---

# Middleware Setup

**mobx-chunk** supports action interceptors—middleware functions that run before or after your custom actions and async flows. Use them to add validation, logging, performance monitoring, or any cross-cutting concerns.

## Current Support

* **Async-only Interceptors**: Out of the box, interceptors apply to your async actions (`store.asyncActions`).

> **Coming Soon:** In the next release, we will introduce three interceptor types:
>
> 1. **General Interceptors**: Wrap all action types (sync & async).
> 2. **Async Interceptors**: Target only async actions.
> 3. **Action Interceptors**: Target only synchronous actions.

## Adding an Interceptor

Import and call `addActionInterceptor` at your app’s root (e.g., entry point) before any actions run:

```ts
import React from "react";
import { addActionInterceptor } from "mobx-chunk";

// Register a global interceptor
addActionInterceptor((ctx, next) => {
  // ctx.chunkName — name of the chunk (store)
  // ctx.actionName — name of the action or async action
  // ctx.args — array of arguments passed to the action

  if (ctx.actionName === "yourActionName") {
    const [payload] = ctx.args;

    // Example: validate payload has an email string
    if (
      typeof payload !== "object" ||
      payload == null ||
      typeof (payload as any).email !== "string"
    ) {
      throw new Error(
        `[ValidationError] ${ctx.chunkName}.${ctx.actionName} expects { email: string }`
      );
    }
  }

  // Proceed to the next interceptor or the actual action
  return next();
});

const App = () => (
  // Your app goes here
  <></>
);

export default App;
```

## Interceptor Context (`ctx`)

| Property         | Description                             |
| ---------------- | --------------------------------------- |
| `ctx.chunkName`  | Name of the chunk/store (e.g., "todo"). |
| `ctx.actionName` | Name of the action or async action.     |
| `ctx.args`       | Arguments array passed to the action.   |

## Interceptor Flow

1. **Registration**: Call `addActionInterceptor` once at startup.
2. **Execution**: For each matching action, interceptors run in order of registration.
3. **Chaining**: Each interceptor must call `next()` to continue the chain.
4. **Error Handling**: Throwing inside an interceptor halts the chain and prevents the action.

With middleware in place, you can enforce rules, log events, and monitor performance across your mobx-chunk stores.
