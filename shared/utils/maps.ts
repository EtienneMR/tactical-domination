export const MAP_SIZE = 12;

export const MAPS = [
  {
    id: "centeredMines",
    name: "Les mines du centre",
    mode: "base",
    players: "1v1",
    image: true,
  },
  {
    id: "edgeMines",
    name: "Les mines des angles",
    mode: "base",
    players: "1v1",
    image: true,
  },
  {
    id: "fourCastles",
    name: "Les quatre châteaux",
    mode: "base",
    players: "1v1v1v1",
    image: true,
  },
  {
    id: "emptyCastles",
    name: "Les châteaux oubliés",
    mode: "base",
    players: "1v1",
    image: true,
  },
  {
    id: "duoCastles",
    name: "Les duos de châteaux",
    mode: "base",
    players: "2v2",
    image: true,
  },
  {
    id: "tripleCastles",
    name: "Les trois châteaux",
    mode: "base",
    players: "1v1v1",
    image: true,
  },
  {
    id: "mountainBarrier",
    name: "La barrière montagneuse",
    mode: "base",
    players: "1v1",
    image: true,
  },
] as const;

export const MAP_MODES = [
  {
    name: "base",
    label: "Jeu de base",
  },
];

export const MAP_IDS = MAPS.map((m) => m.id);
