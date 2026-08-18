import { Container, Graphics } from "pixi.js";

interface StarLayer {
  container: Container;
  parallax: number; // fraction of camera movement this layer follows (lower = further away)
  driftPhase: number;
  driftSpeed: number;
}

const FIELD_SIZE = 9000;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Multi-layer star field + faint nebula regions. Stars are baked into a
 * handful of Graphics batches (not one object per star) and parallax is
 * achieved by moving whole layers by a fraction of camera pan — no per-star
 * animation cost.
 */
export class Starfield {
  readonly root = new Container();
  private layers: StarLayer[] = [];
  private nebula = new Container();
  private time = 0;

  constructor(domainColors: Array<{ x: number; y: number; color: number }>) {
    this.root.addChild(this.nebula);
    this.buildNebula(domainColors);
    this.buildLayer(520, 0.75, 0.08, 1, 0x8fa2c9);
    this.buildLayer(320, 0.45, 0.12, 1.6, 0xaebbe0);
    this.buildLayer(140, 0.22, 0.16, 2.4, 0xffffff);
  }

  private buildNebula(domainColors: Array<{ x: number; y: number; color: number }>) {
    const g = new Graphics();
    for (const d of domainColors) {
      const steps = 3;
      for (let i = steps; i >= 1; i--) {
        const t = i / steps;
        g.circle(d.x, d.y, 900 * t).fill({ color: d.color, alpha: 0.018 * (1 - t * 0.4) });
      }
    }
    this.nebula.addChild(g);
  }

  private buildLayer(
    count: number,
    parallax: number,
    driftSpeed: number,
    maxRadius: number,
    color: number
  ) {
    const rand = mulberry32(count * 7919 + 13);
    const container = new Container();
    const g = new Graphics();
    for (let i = 0; i < count; i++) {
      const x = (rand() - 0.5) * FIELD_SIZE;
      const y = (rand() - 0.5) * FIELD_SIZE;
      const r = 0.4 + rand() * maxRadius;
      const alpha = 0.25 + rand() * 0.55;
      g.circle(x, y, r).fill({ color, alpha });
    }
    container.addChild(g);
    this.root.addChild(container);
    this.layers.push({ container, parallax, driftPhase: rand() * Math.PI * 2, driftSpeed });
  }

  /** Call every frame with camera position and delta time (ms). */
  update(cameraX: number, cameraY: number, deltaMs: number) {
    this.time += deltaMs;
    for (const layer of this.layers) {
      layer.container.x =
        cameraX * layer.parallax +
        Math.sin(this.time * 0.00004 * layer.driftSpeed + layer.driftPhase) * 6;
      layer.container.y =
        cameraY * layer.parallax +
        Math.cos(this.time * 0.00003 * layer.driftSpeed + layer.driftPhase) * 6;
    }
    this.nebula.x = cameraX * 0.85;
    this.nebula.y = cameraY * 0.85;
  }
}
