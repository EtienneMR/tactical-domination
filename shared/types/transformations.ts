export interface TransformationPayload {
  type: string;
  [key: string]: unknown;
}

export interface Transformation {
  type: string;
  validate(gameState: GameState): void;
  apply(gameState: GameState): void;
  toPayload(): TransformationPayload;
}

export interface TransformationClass {
  fromPayload(payload: TransformationPayload): Transformation;
}
