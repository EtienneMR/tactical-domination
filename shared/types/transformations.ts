export interface TransformationPayload {
  type: string;
  [key: string]: unknown;
}

export interface Transformation {
  validate(gameState: GameState): void;
  apply(gameState: GameState): void;
  toPayload(): TransformationPayload;
}

export interface TransformationClass {
  type: string;
  fromPayload(payload: TransformationPayload): Transformation;
}
