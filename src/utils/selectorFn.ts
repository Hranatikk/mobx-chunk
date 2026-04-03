const SELECTOR_METHOD = Symbol("mobx-chunk:selector-method")

/**
 * Marks a view function as a parameterized method (not a computed getter).
 *
 * By default, `views` functions with zero declared parameters are treated
 * as computed getters.  If your function uses default params, rest params,
 * or destructuring (which report `fn.length === 0`), wrap it with
 * `selectorFn` so the library treats it as a callable method.
 *
 * @example
 * views: (self) => ({
 *   filteredItems: selectorFn((...tags: string[]) =>
 *     self.items.filter(i => tags.includes(i.tag))
 *   ),
 * })
 */
export function selectorFn<F extends (...args: any[]) => any>(fn: F): F {
  ;(fn as any)[SELECTOR_METHOD] = true
  return fn
}

export function isSelectorMethod(fn: unknown): boolean {
  return typeof fn === "function" && (fn as any)[SELECTOR_METHOD] === true
}
