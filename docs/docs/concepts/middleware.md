---
sidebar_position: 4
---

# Middleware

Intercept actions for logging, validation, or side effects.

## Example

```ts
addActionInterceptor((ctx, next) => {

  if (ctx.actionName === "login") {
    const [payload] = ctx.args
    if (
      typeof payload !== "object" ||
      payload == null ||
      typeof (payload as any).login !== "string"
    ) {
      throw new Error(
        `[ValidationError] ${ctx.chunkName}.${ctx.actionName} expects { login: string }`
      )
    }
  }

  return next()
})
```