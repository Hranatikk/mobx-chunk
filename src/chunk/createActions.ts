/* eslint-disable no-extra-semi */
import { action, makeObservable } from "mobx"
import type { ChunkConfig } from "../types/chunk"
import type { AnyFn } from "../types/common"
import { capitalize } from "../utils/capitalize"

type ActionsMap = Record<string, AnyFn>

/**
 * Create actions object with:
 * 1) Default setters for initialState: set${Cap(key)}
 * 2) Custom actions
 *
 * @param self — Store instance
 * @param config — Initial chunk config
 * @returns actions Object
 */
export function createActions<
  Self extends object,
  TState extends Record<string, any>,
  TSync extends ActionsMap,
>(self: Self, config: ChunkConfig<TState, TSync, any, any>): ActionsMap {
  const defaultSetters: ActionsMap = {}

  Object.keys(config.initialState).forEach((key) => {
    const cap = capitalize(key)
    Object.defineProperty(defaultSetters, `set${cap}`, {
      configurable: true,
      enumerable: true,
      value: (v: any) => {
        ;(self as any)[key] = v
      },
      writable: true,
    })
  })

  const syncFromConfig = config.actions?.(self) ?? {}

  const allSetters = { ...defaultSetters, ...syncFromConfig }

  const annotations = Object.fromEntries(
    Object.keys(allSetters).map((name) => [name, action.bound])
  )

  makeObservable(allSetters, annotations)

  return allSetters
}
