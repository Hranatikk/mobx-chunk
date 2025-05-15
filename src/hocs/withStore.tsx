import type { ComponentType, FC } from "react"
import React, { useMemo } from "react"

/**
 * StoreFactory can be either a store instance or a factory function that returns a store.
 *
 * @template S - The type of the store.
 */
export type StoreFactory<S> = S | (() => S)

/**
 * Higher-order component to provide a MobX store instance (or any store) to a React component.
 * The store is initialized once using useMemo, either by calling the provided factory
 * or by using the passed-in instance directly.
 *
 * @template P - Props type of the wrapped component.
 * @template S - Type of the store to inject.
 *
 * @param {ComponentType<P>} Component - The React component to wrap.
 * @param {StoreFactory<S>} storeOrFactory - A store instance or a factory function returning a store.
 * @returns {FC<P>} A functional component that initializes the store and renders the wrapped component.
 */
export function withStore<P extends object, S>(
  Component: ComponentType<P>,
  storeOrFactory: StoreFactory<S>
): FC<P> {
  /**
   * Wrapped component that ensures the store is created once.
   *
   * @param {P} props - Props forwarded to the wrapped component.
   * @returns {JSX.Element} The rendered wrapped component.
   */
  const Wrapped: FC<P> = (props) => {
    // Initialize or retrieve the store instance once
    useMemo(() => {
      const instance =
        typeof storeOrFactory === "function"
          ? (storeOrFactory as () => S)()
          : storeOrFactory

      return instance
    }, [])

    // Render the original component with all props
    return <Component {...props} />
  }

  return Wrapped
}
