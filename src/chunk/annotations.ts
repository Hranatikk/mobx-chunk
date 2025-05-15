import { action, computed, flow, observable } from "mobx"
import type { ChunkConfig } from "../types/chunk"
import type { AnyFn } from "../types/common"
import { capitalize } from "../utils/capitalize"

/**
 * Generate MobX annotations based on the provided chunk configuration and methods.
 *
 * @template TState - Shape of the state object.
 * @template TActions - Synchronous action methods.
 * @template TAsync - Asynchronous (generator) methods.
 * @template TViews - Computed view methods.
 *
 * @param {ChunkConfig<TState, TActions, TAsync, TViews>} config - The chunk configuration object.
 * @param {TActions} sync - Synchronous methods to annotate with `action.bound`.
 * @param {TAsync} asyncM - Generator methods to annotate with `flow` (or simple async actions).
 * @param {TViews} [viewsObj] - View methods to annotate with `computed`.
 * @returns {Record<string, any>} A mapping from property and method names to MobX annotation decorators.
 */
export function generateAnnotations<
  TState extends Record<string, unknown>,
  TActions extends Record<string, AnyFn>,
  TAsync extends Record<string, AnyFn>,
  TViews extends Record<string, AnyFn>,
>(
  config: ChunkConfig<TState, TActions, TAsync, TViews>,
  sync: TActions,
  asyncM: TAsync,
  viewsObj?: TViews
): Record<string, any> {
  const annotations: Record<string, any> = {}
  const stateKeys = Object.keys(config.initialState) as Array<keyof TState>

  stateKeys.forEach((key) => {
    annotations[key as string] = observable
    const cap = capitalize(key as string)
    annotations[`set${cap}`] = action.bound
  })

  Object.keys(sync).forEach((key) => {
    annotations[key] = action.bound
  })

  Object.keys(asyncM).forEach((key) => {
    annotations[key] = flow
  })

  if (viewsObj) {
    Object.keys(viewsObj).forEach((key) => {
      annotations[key] = computed
    })
  }

  return annotations
}
