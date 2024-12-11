import { type WriteCell } from "./game";

export interface GenerationRule {
  readonly if: (cell: WriteCell, opp: WriteCell) => boolean;
  readonly then?: Partial<WriteCell>;
  readonly action?: (cell: WriteCell) => void;
  readonly when: "pre" | "step" | "post";
}
