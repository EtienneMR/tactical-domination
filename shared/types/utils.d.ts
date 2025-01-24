export type MaybePromise<T> = T | Promise<T>

export type MaybeGame = Game | null

export type ReadonlyDeep<T> = readonly {
  readonly [P in keyof T]: ReadonlyDeep<T[P]>
}
