import { Container, Graphics, Text } from "pixi.js";
import type { UniverseNode } from "@moodle-universum/shared";
import { COLORS, STATUS_ALPHA } from "./constants";

export type ZoomLevel = "far" | "medium" | "close";

const STATUS_GLYPH: Record<string, string> = {
  not_started: "○",
  in_progress: "◐",
  completed: "●",
};

export function nodeRadius(node: UniverseNode): number {
  const base = node.type === "course" ? 15 : 7;
  return base + node.size * 3.2 + node.importance * 0.6;
}

/**
 * Visual representation of a single universe node. Owns its own Pixi
 * display objects; the renderer only calls update() on camera/selection
 * changes, never recreates instances per frame.
 */
export class NodeSprite {
  readonly node: UniverseNode;
  readonly container: Container;
  private readonly glow: Graphics;
  private readonly core: Graphics;
  private readonly ring: Graphics;
  private readonly glyph: Text;
  private readonly label: Text;
  private readonly percentLabel: Text;
  readonly radius: number;
  private domainColor: number;

  constructor(node: UniverseNode, domainColor: number) {
    this.node = node;
    this.domainColor = domainColor;
    this.radius = nodeRadius(node);

    this.container = new Container();
    this.container.x = node.x;
    this.container.y = node.y;
    this.container.eventMode = "static";
    this.container.cursor = "pointer";
    this.container.hitArea = {
      contains: (x: number, y: number) => x * x + y * y <= (this.radius + 6) ** 2,
    };

    this.glow = new Graphics();
    this.core = new Graphics();
    this.ring = new Graphics();
    this.glyph = new Text({
      text: STATUS_GLYPH[node.status] ?? "○",
      style: { fontSize: 9, fill: 0x0a0e18, fontFamily: "Inter, system-ui, sans-serif" },
    });
    this.glyph.anchor.set(0.5);

    this.label = new Text({
      text: node.name,
      style: {
        fontSize: 12,
        fill: COLORS.textPrimary,
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: node.type === "course" ? "600" : "400",
      },
    });
    this.label.anchor.set(0.5, 0);
    this.label.y = this.radius + 6;
    this.label.visible = false;
    this.label.resolution = 2;

    this.percentLabel = new Text({
      text: "",
      style: {
        fontSize: 10,
        fill: COLORS.textDim,
        fontFamily: "Inter, system-ui, sans-serif",
      },
    });
    this.percentLabel.anchor.set(0.5, 0);
    this.percentLabel.y = this.radius + 21;
    this.percentLabel.visible = false;
    this.percentLabel.resolution = 2;

    this.container.addChild(
      this.glow,
      this.core,
      this.ring,
      this.glyph,
      this.label,
      this.percentLabel
    );
    this.redraw(false, false, false);
  }

  setDomainColor(color: number) {
    this.domainColor = color;
  }

  redraw(selected: boolean, dimmed: boolean, connected: boolean) {
    const { status, completion } = this.node;
    const baseAlpha = STATUS_ALPHA[status] ?? 0.4;
    const dimFactor = dimmed && !selected && !connected ? 0.28 : 1;

    // glow: soft concentric circles, stronger for higher-progress nodes
    this.glow.clear();
    const glowStrength = status === "completed" ? 1.35 : status === "in_progress" ? 1 : 0.45;
    const glowRadius = this.radius * (2.4 + glowStrength);
    const glowSteps = 4;
    for (let i = glowSteps; i >= 1; i--) {
      const t = i / glowSteps;
      this.glow
        .circle(0, 0, this.radius + (glowRadius - this.radius) * t)
        .fill({ color: this.domainColor, alpha: 0.05 * glowStrength * (1 - t) * dimFactor });
    }

    // core
    this.core.clear();
    this.core
      .circle(0, 0, this.radius)
      .fill({ color: this.domainColor, alpha: baseAlpha * 0.85 * dimFactor });
    this.core
      .circle(0, 0, this.radius)
      .stroke({
        width: selected ? 2.5 : 1.2,
        color: selected ? COLORS.selectionRing : this.domainColor,
        alpha: (selected ? 1 : 0.9) * dimFactor,
      });

    // progress ring
    this.ring.clear();
    if (status === "in_progress" && completion != null) {
      const start = -Math.PI / 2;
      const end = start + (completion / 100) * Math.PI * 2;
      this.ring
        .arc(0, 0, this.radius + 4, start, end)
        .stroke({ width: 2.5, color: 0xffffff, alpha: 0.8 * dimFactor, cap: "round" });
    } else if (status === "completed") {
      this.ring
        .circle(0, 0, this.radius + 4)
        .stroke({ width: 2, color: 0xffffff, alpha: 0.6 * dimFactor });
    }

    this.glyph.alpha = dimFactor;
    this.glyph.style.fill = status === "not_started" ? this.domainColor : 0x0a0e18;
    if (status === "not_started") {
      // hollow badge: draw as outline dot instead of filled glyph background
      this.glyph.text = "○";
    }

    this.label.alpha = dimFactor;
    this.percentLabel.alpha = dimFactor;
    if (completion != null && status === "in_progress") {
      this.percentLabel.text = `${completion}%`;
    } else if (status === "completed") {
      this.percentLabel.text = "COMPLETE";
    } else {
      this.percentLabel.text = "";
    }

    this.container.zIndex = selected ? 1000 : connected ? 500 : this.node.importance;
  }

  setLabelVisibility(zoom: ZoomLevel, selected: boolean, connected: boolean) {
    const importantEnough = this.node.importance >= 4 || this.node.type === "course";
    let showLabel = false;
    let showPercent = false;

    if (zoom === "close") {
      showLabel = true;
      showPercent = selected || connected || this.node.type === "course";
    } else if (zoom === "medium") {
      showLabel = importantEnough || selected || connected;
      showPercent = selected;
    } else {
      showLabel = selected;
      showPercent = false;
    }

    this.label.visible = showLabel;
    this.percentLabel.visible = showPercent && this.percentLabel.text.length > 0;
  }

  setLabelScale(inverseScale: number) {
    this.label.scale.set(inverseScale);
    this.percentLabel.scale.set(inverseScale);
    this.glyph.scale.set(inverseScale);
    this.glyph.y = 0;
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
