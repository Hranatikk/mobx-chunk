import type { AnyQueryDefinition, QueriesRecord } from "../types/query"

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never

type BuilderDefinitions<F> = F extends (self: any) => infer R ? R : never

type CombinedDefinitions<T extends Record<string, (self: any) => QueriesRecord>> =
  UnionToIntersection<BuilderDefinitions<T[keyof T]>>

/**
 * Merges multiple query builder functions into a single builder.
 *
 * Each builder receives `self` and returns an object of QueryDefinition /
 * InfiniteQueryDefinition / MutationDefinition entries. `combineQueries`
 * merges them all into one flat object.
 *
 * @example
 * ```ts
 * const store = createChunk({
 *   name: 'app',
 *   initialState: {},
 *   queries: combineQueries({
 *     users: userQueries,
 *     posts: postQueries,
 *   }),
 * })
 * ```
 */
export function combineQueries<
  T extends Record<string, (self: any) => Record<string, AnyQueryDefinition>>,
>(factories: T): (self: any) => CombinedDefinitions<T> {
  return (self) =>
    Object.assign(
      {} as Record<string, any>,
      ...Object.values(factories).map((fn) => fn(self)),
    ) as CombinedDefinitions<T>
}
