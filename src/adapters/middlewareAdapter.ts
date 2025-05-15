import type { StoreInstance } from "../types/chunk"

/**
 * Context passed to each action interceptor.
 *
 * @property chunkName - Name of the chunk (store) where the action is called.
 * @property actionName - Name of the action method being invoked.
 * @property args - Arguments passed to the action method.
 * @property store - Reference to the store instance.
 */
export interface ActionContext {
  chunkName: string
  actionName: string
  args: unknown[]
  store: StoreInstance<any, any, any, any>
}

/**
 * Interceptor function signature: receives the action context and a `next` function
 * to call the next interceptor or the original action.
 *
 * @param ctx - Context of the action invocation.
 * @param next - Function to invoke the next interceptor or the action itself.
 * @returns The return value of the action or the value returned by an interceptor.
 */
export type ActionInterceptor = (
  ctx: ActionContext,
  next: () => unknown
) => unknown

const interceptors: ActionInterceptor[] = []

/**
 * Register a new action interceptor. Interceptors are called in the order of registration.
 *
 * @param interceptor - The interceptor to add.
 */
export function addActionInterceptor(interceptor: ActionInterceptor) {
  interceptors.push(interceptor)
}

/**
 * Clear all registered action interceptors.
 */
export function clearActionInterceptors() {
  interceptors.length = 0
}

/**
 * Execute the chain of interceptors around an action, then call the action.
 *
 * @param ctx - Context of the action invocation.
 * @param actionFn - The actual action function to call after interceptors.
 * @returns The result of the action (or an interceptor overriding it).
 */
export function runActionInterceptors(
  ctx: ActionContext,
  actionFn: (...args: unknown[]) => unknown
): unknown {
  let index = -1

  function dispatch(): unknown {
    index++
    if (index < interceptors.length) {
      const interceptor = interceptors[index]

      return interceptor(ctx, dispatch)
    }

    return actionFn(...ctx.args)
  }

  return dispatch()
}
