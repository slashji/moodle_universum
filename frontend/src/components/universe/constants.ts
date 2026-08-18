/** Camera zoom (world scale) thresholds that drive semantic zoom / LOD. */
export const ZOOM = {
  MIN: 0.035,
  MAX: 3.2,
  DEFAULT: 0.1,
  FAR_LABEL_MAX: 0.13, // below this: only domain labels
  MEDIUM_LABEL_MAX: 0.45, // below this: course + high-importance labels
  // >= MEDIUM_LABEL_MAX: close zoom, show most labels + detail
};

export const COLORS = {
  background: 0x05060c,
  edgeDefault: 0x3b4a68,
  edgeHighlight: 0x9fd8ff,
  edgeDim: 0x1b2334,
  selectionRing: 0xffffff,
  textPrimary: 0xe8ecf6,
  textDim: 0x6b7690,
  domainLabel: 0xaeb8d4,
};

export const EDGE_STYLE: Record<
  string,
  { dash: number; gap: number; width: number; alpha: number }
> = {
  prerequisite: { dash: 0, gap: 0, width: 1.6, alpha: 0.55 }, // solid
  related: { dash: 4, gap: 4, width: 1, alpha: 0.35 }, // fine dashed
  "recommended-next": { dash: 8, gap: 5, width: 1.3, alpha: 0.45 }, // long dash
  contains: { dash: 1.5, gap: 3.5, width: 1, alpha: 0.3 }, // dotted
  unlocks: { dash: 0, gap: 0, width: 1.8, alpha: 0.5 }, // solid, arrowed
};

export const STATUS_ALPHA: Record<string, number> = {
  not_started: 0.35,
  in_progress: 0.85,
  completed: 1,
};
