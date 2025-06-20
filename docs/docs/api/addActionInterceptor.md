---
sidebar_position: 8
---


# API: `addActionInterceptor`

Register a global middleware function that intercepts chunk actions and async actions. Useful for validation, logging, or performance tracking.

```ts
function addActionInterceptor(
  interceptor: (
    ctx: ActionContext,
    next: () => any
  ) => any
): void
```

## `ActionContext` Interface

```ts
interface ActionContext {
  /**
   * Name of the chunk (store) where the action is defined.
   */
  chunkName: string;

  /**
   * Name of the action or async action being executed.
   */
  actionName: string;

  /**
   * Arguments passed to the action.
   */
  args: any[];
}
```

## Parameters

* `interceptor`: A function called before an action executes.

  * Receives a `ctx` object with `chunkName`, `actionName`, and `args`.
  * Must call `next()` to continue the chain and eventually run the action.
  * Can throw errors to halt execution or modify behavior.

## Behavior

1. **Registration**: Call once at app startup. Interceptors apply globally in registration order.
2. **Interception**: For each action or async action invocation, all registered interceptors run sequentially.
3. **Chaining**: Each interceptor calls `next()` to pass control to the next interceptor or final action.
4. **Error Handling**: Throwing inside an interceptor stops further interceptors and prevents the action from running.

> **Note:** Currently, interceptors apply to async actions. In the next release, support will expand to include separate interceptor types for sync actions, async actions, and general actions.

## Example

```ts
import { addActionInterceptor } from "mobx-chunk";

// Validate that payload has an 'email' field when calling 'createUser'
addActionInterceptor((ctx, next) => {
  if (ctx.actionName === "createUser") {
    const [payload] = ctx.args;
    if (!payload || typeof payload.email !== "string") {
      throw new Error(
        `[ValidationError] ${ctx.chunkName}.${ctx.actionName} expects { email: string }`
      );
    }
  }
  // Continue to next interceptor or actual action
  return next();
});
```

Use `addActionInterceptor` to enforce data integrity, log user interactions, or measure performance across your mobx-chunk stores.
