type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

type BuilderMethods<F> = F extends (self: any) => infer R
  ? {
      [K in keyof R]: R[K] extends (...args: infer A) => any
        ? (...args: A) => Promise<void>
        : never
    }
  : never

type Combined<T extends Record<string, (self: any) => any>> =
  UnionToIntersection<BuilderMethods<T[keyof T]>>

/**
 * Merges multiple “builder” functions into a single flat API of async methods.
 *
 * Each builder is a function that accepts a shared context (`self`) and returns
 * an object whose values are asynchronous methods.  `combineAsync` invokes each
 * builder with the provided context and binds all of its methods onto one result
 * object, preserving original parameter lists and return types.
 *
 * @template T
 *   A mapping from keys to builder functions:
 *   Record<string, (self: any) => Record<string, (...args: any[]) => Promise<any>>>
 *
 * @param {T} builders
 *   An object whose values are builder functions.  Each builder(self) must return
 *   an object of async methods.
 *
 * @param {any} context
 *   The shared `self` object to pass into every builder.
 *
 * @returns {CombinedAsync<T>}
 *   A single object combining every async method from all builders, each bound
 *   to the given context.  The resulting signatures are:
 *   (...args) => Promise<ReturnType>
 *
 */

export function combineAsync<T extends Record<string, (self: any) => any>>(
  factories: T
): (self: any) => Combined<T> {
  return (self) =>
    Object.assign(
      {} as T,
      ...Object.values(factories).map((fn) => fn(self as any))
    )
}
