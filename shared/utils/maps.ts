export const MAP_SIZE = 12;

export const MAPS = [
  {
    id: "centeredMines",
    name: "Les mines du centre",
    label: "1v1",
    image: true,
  },
  { id: "edgeMines", name: "Les mines des angles", label: "1v1", image: true },
  {
    id: "fourCastles",
    name: "Les quatre châteaux",
    label: "1v1v1v1",
    image: true,
  },
  {
    id: "emptyCastles",
    name: "Les châteaux oubliés",
    label: "1v1",
    image: true,
  },
  { id: "duoCastles", name: "Les duos de châteaux", label: "2v2", image: true },
  {
    id: "tripleCastles",
    name: "Les trois châteaux",
    label: "1v1v1",
    image: true,
  },
  {
    id: "mountainBarrier",
    name: "La barrière montagneuse",
    label: "1v1",
    image: true,
  },
] as const;

export const MAP_IDS = MAPS.map((m) => m.id);
