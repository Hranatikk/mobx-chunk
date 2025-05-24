/**
 * A generic function type with arbitrary arguments and return value.
 */
export type AnyFn = (...args: any[]) => any
export type RecordWithAnyFn = Record<string, AnyFn>
export type RecordWithAny = Record<string, unknown>
