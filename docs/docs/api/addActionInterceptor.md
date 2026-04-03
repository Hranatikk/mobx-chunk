---
sidebar_position: 8
---


# API: `addActionInterceptor` / `removeActionInterceptor`

Register (and unregister) global middleware functions that intercept chunk async actions. Useful for validation, logging, or performance tracking.

## `addActionInterceptor`

```ts
function addActionInterceptor(
  interceptor: (
    ctx: ActionContext,
    next: () => any
  ) => any
): void
```

Registers an interceptor that will be called before every async action.

## `removeActionInterceptor`

```ts
function removeActionInterceptor(
  interceptor: (
    ctx: ActionContext,
    next: () => any
  ) => any
): boolean
```

Removes a previously registered interceptor. Returns `true` if the interceptor was found and removed, `false` otherwise.

> **Tip:** Keep a reference to the interceptor function so you can remove it later.

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

1. **Registration**: Call `addActionInterceptor` at app startup. Interceptors apply globally in registration order.
2. **Removal**: Call `removeActionInterceptor` with the same function reference to unregister it.
3. **Interception**: For each async action invocation, all registered interceptors run sequentially.
4. **Chaining**: Each interceptor calls `next()` to pass control to the next interceptor or final action.
5. **Error Handling**: Throwing inside an interceptor stops further interceptors and prevents the action from running.

## Example

```ts
import { addActionInterceptor, removeActionInterceptor } from "mobx-chunk";

// Define the interceptor
const validateEmail = (ctx, next) => {
  if (ctx.actionName === "createUser") {
    const [payload] = ctx.args;
    if (!payload || typeof payload.email !== "string") {
      throw new Error(
        `[ValidationError] ${ctx.chunkName}.${ctx.actionName} expects { email: string }`
      );
    }
  }
  return next();
};

// Register
addActionInterceptor(validateEmail);

// Later, unregister when no longer needed
removeActionInterceptor(validateEmail);
```

Use `addActionInterceptor` to enforce data integrity, log user interactions, or measure performance across your mobx-chunk stores. Use `removeActionInterceptor` to clean up interceptors that are no longer needed.
