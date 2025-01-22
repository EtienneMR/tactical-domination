export interface Player {
  readonly index: number
  alive: boolean
  ressources: {
    gold: number
    food: number
  }
}

export interface User {
  userId: string
  name: string
  index: number | null
}

export type ResourceType = keyof Player["ressources"]
