import { Assets, Rectangle, Texture } from "pixi.js";

const TEXTURE_FORMAT = [
  "br",
  "blr",
  "bl",
  "b",
  "tbr",
  "tblr",
  "tbl",
  "tb",
  "tr",
  "tlr",
  "tl",
  "t",
  "r",
  "lr",
  "l",
  "",
];
const TEXTURE_FULL = "tblr";

export default function getGroundData(
  cell: Cell,
  map: Cell[][],
  bundle: string
): { texture: Texture | null; full: boolean } {
  if (cell.biome == "plains") {
    return { texture: null, full: false };
  }
  const baseTexture = Assets.get(`${bundle}:biomes:${cell.biome}_tiles`);

  const matchinBiomes = [cell.biome as BiomeType, undefined];

  const isMatching = (x: number, y: number) =>
    matchinBiomes.includes((map[x] && map[x][y])?.biome);

  const frameCode = [
    isMatching(cell.x, cell.y - 1) ? "t" : "",
    isMatching(cell.x, cell.y + 1) ? "b" : "",
    isMatching(cell.x - 1, cell.y) ? "l" : "",
    isMatching(cell.x + 1, cell.y) ? "r" : "",
  ].join("");

  const tiles_per_row = Math.sqrt(TEXTURE_FORMAT.length);
  const tile_width = baseTexture.width / tiles_per_row;
  const tile_height = baseTexture.height / tiles_per_row;

  let frameIndex = TEXTURE_FORMAT.indexOf(frameCode);

  if (frameIndex == -1) frameIndex = TEXTURE_FORMAT.indexOf(TEXTURE_FULL);

  const x = frameIndex % tiles_per_row;
  const y = Math.floor(frameIndex / tiles_per_row);

  const framedTexture = new Texture({
    source: baseTexture,
    frame: new Rectangle(
      x * tile_width,
      y * tile_height,
      tile_height - 1,
      tile_width - 1
    ),
  });

  return { texture: framedTexture, full: frameCode == TEXTURE_FULL };
}
