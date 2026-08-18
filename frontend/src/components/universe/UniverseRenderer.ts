import { Application, Container, Graphics, Text } from "pixi.js";
import type { Domain, UniverseEdge, UniverseNode } from "@moodle-universum/shared";
import { NodeSprite, type ZoomLevel } from "./NodeSprite";
import { drawEdges } from "./edgeVisuals";
import { Starfield } from "./Starfield";
import { COLORS, ZOOM } from "./constants";

interface Camera {
  x: number;
  y: number;
  scale: number;
}

interface FlyAnimation {
  startX: number;
  startY: number;
  startScale: number;
  targetX: number;
  targetY: number;
  targetScale: number;
  startTime: number;
  duration: number;
}

export interface RendererCallbacks {
  onNodeClick: (id: string) => void;
  onNodeDoubleClick: (id: string) => void;
  onBackgroundClick: () => void;
  onNodeDragEnd: (id: string, x: number, y: number) => void;
  onZoomChange: (scale: number, zoomLevel: ZoomLevel) => void;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function zoomLevelFor(scale: number): ZoomLevel {
  if (scale < ZOOM.FAR_LABEL_MAX) return "far";
  if (scale < ZOOM.MEDIUM_LABEL_MAX) return "medium";
  return "close";
}

export class UniverseRenderer {
  private app = new Application();
  private world = new Container();
  private edgesLayer = new Graphics();
  private nodesLayer = new Container();
  private domainLabelLayer = new Container();
  private starfield: Starfield | null = null;

  private nodeSprites = new Map<string, NodeSprite>();
  private edges: UniverseEdge[] = [];
  private domains: Domain[] = [];
  private domainColorByKey = new Map<string, number>();
  private domainLabelTexts: Array<{ text: Text; domain: Domain }> = [];

  private camera: Camera = { x: 0, y: 0, scale: ZOOM.DEFAULT };
  private flyAnimation: FlyAnimation | null = null;
  private edgesDirty = true;
  private selectedNodeId: string | null = null;
  private connectedNodeIds = new Set<string>();
  private connectedEdgeIds = new Set<string>();
  private editorMode = false;

  private isPanning = false;
  private panMoved = false;
  private lastPointer = { x: 0, y: 0 };
  private draggingNodeId: string | null = null;

  private lastClickId: string | null = null;
  private lastClickTime = 0;
  private lastZoomEmit = 0;

  private destroyed = false;
  private initialized = false;

  constructor(private readonly callbacks: RendererCallbacks) {}

  async init(container: HTMLElement) {
    await this.app.init({
      background: COLORS.background,
      backgroundAlpha: 1,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      width: container.clientWidth || 800,
      height: container.clientHeight || 600,
    });

    if (this.destroyed) {
      // destroy() was called while init() was still in flight (e.g. React
      // StrictMode's dev-only mount/unmount/mount) — tear down and bail.
      this.app.destroy(true, { children: true });
      return;
    }
    this.initialized = true;
    container.appendChild(this.app.canvas);
    // Assigned after init() resolves (renderer now guaranteed to exist) —
    // setting this in the init() options races the renderer's own setup.
    this.app.resizeTo = container;

    this.world.addChild(this.edgesLayer, this.domainLabelLayer, this.nodesLayer);
    this.app.stage.addChild(this.world);
    this.nodesLayer.sortableChildren = true;

    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.on("pointerdown", this.onStagePointerDown);
    this.app.stage.on("pointermove", this.onStagePointerMove);
    this.app.stage.on("pointerup", this.onStagePointerUp);
    this.app.stage.on("pointerupoutside", this.onStagePointerUp);

    this.app.canvas.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("resize", this.onResize);

    this.applyCameraToWorld();
    this.app.ticker.add(this.onTick);
  }

  private onResize = () => {
    this.app.stage.hitArea = this.app.screen;
    this.applyCameraToWorld();
  };

  setData(nodes: UniverseNode[], edges: UniverseEdge[], domains: Domain[]) {
    if (!this.initialized) return;
    this.domains = domains;
    this.edges = edges;
    this.domainColorByKey = new Map(
      domains.map((d) => [d.key, parseInt(d.color.replace("#", ""), 16)])
    );

    if (!this.starfield) {
      this.starfield = new Starfield(
        domains.map((d) => ({
          x: d.centerX,
          y: d.centerY,
          color: this.domainColorByKey.get(d.key) ?? 0x888888,
        }))
      );
      this.app.stage.addChildAt(this.starfield.root, 0);
      this.buildDomainLabels();
    }

    const seenIds = new Set(nodes.map((n) => n.id));
    for (const [id, sprite] of this.nodeSprites) {
      if (!seenIds.has(id)) {
        sprite.destroy();
        this.nodeSprites.delete(id);
      }
    }

    for (const node of nodes) {
      const color = this.domainColorByKey.get(node.domain ?? "") ?? 0x8899bb;
      const existing = this.nodeSprites.get(node.id);
      if (existing) {
        existing.setDomainColor(color);
        existing.container.x = node.x;
        existing.container.y = node.y;
        Object.assign(existing.node, node);
        existing.redraw(node.id === this.selectedNodeId, false, false);
      } else {
        const sprite = new NodeSprite(node, color);
        sprite.container.on("pointerdown", (e) => this.onNodePointerDown(e, node.id));
        sprite.container.on("pointerup", () => this.onNodePointerUp(node.id));
        this.nodesLayer.addChild(sprite.container);
        this.nodeSprites.set(node.id, sprite);
      }
    }

    this.recomputeSelectionHighlight();
    this.edgesDirty = true;
    this.updateVisibility();
  }

  private buildDomainLabels() {
    this.domainLabelLayer.removeChildren();
    this.domainLabelTexts = [];
    for (const domain of this.domains) {
      const text = new Text({
        text: domain.name.toUpperCase(),
        style: {
          fontSize: 30,
          fill: COLORS.domainLabel,
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: "700",
          letterSpacing: 3,
        },
      });
      text.anchor.set(0.5);
      text.x = domain.centerX;
      text.y = domain.centerY;
      text.resolution = 2;
      this.domainLabelLayer.addChild(text);
      this.domainLabelTexts.push({ text, domain });
    }
  }

  setSelection(id: string | null) {
    if (!this.initialized) return;
    this.selectedNodeId = id;
    this.recomputeSelectionHighlight();
    this.edgesDirty = true;
    this.updateVisibility();
  }

  private recomputeSelectionHighlight() {
    this.connectedNodeIds = new Set();
    this.connectedEdgeIds = new Set();
    if (this.selectedNodeId) {
      for (const e of this.edges) {
        if (e.source === this.selectedNodeId) {
          this.connectedNodeIds.add(e.target);
          this.connectedEdgeIds.add(e.id);
        } else if (e.target === this.selectedNodeId) {
          this.connectedNodeIds.add(e.source);
          this.connectedEdgeIds.add(e.id);
        }
      }
    }
    for (const [id, sprite] of this.nodeSprites) {
      const selected = id === this.selectedNodeId;
      const connected = this.connectedNodeIds.has(id);
      const dimmed = this.selectedNodeId != null;
      sprite.redraw(selected, dimmed, connected);
    }
  }

  setEditorMode(on: boolean) {
    this.editorMode = on;
    for (const sprite of this.nodeSprites.values()) {
      sprite.container.cursor = on ? "grab" : "pointer";
    }
  }

  flyTo(nodeId: string) {
    if (!this.initialized) return;
    const sprite = this.nodeSprites.get(nodeId);
    if (!sprite) return;
    const targetScale = clamp(Math.max(this.camera.scale, 0.6), ZOOM.MIN, ZOOM.MAX);
    this.flyAnimation = {
      startX: this.camera.x,
      startY: this.camera.y,
      startScale: this.camera.scale,
      targetX: sprite.container.x,
      targetY: sprite.container.y,
      targetScale,
      startTime: performance.now(),
      duration: 700,
    };
  }

  zoomBy(factor: number) {
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;
    this.zoomAtScreenPoint(centerX, centerY, factor);
  }

  resetView() {
    this.flyAnimation = {
      startX: this.camera.x,
      startY: this.camera.y,
      startScale: this.camera.scale,
      targetX: 0,
      targetY: 0,
      targetScale: ZOOM.DEFAULT,
      startTime: performance.now(),
      duration: 600,
    };
  }

  destroy() {
    this.destroyed = true;
    if (!this.initialized) return; // init() will tear down once it resolves
    window.removeEventListener("resize", this.onResize);
    this.app.canvas.removeEventListener("wheel", this.onWheel);
    this.app.destroy(true, { children: true });
  }

  // ---- input handling -----------------------------------------------

  private onStagePointerDown = (e: import("pixi.js").FederatedPointerEvent) => {
    if (this.draggingNodeId) return;
    this.isPanning = true;
    this.panMoved = false;
    this.lastPointer = { x: e.global.x, y: e.global.y };
  };

  private onStagePointerMove = (e: import("pixi.js").FederatedPointerEvent) => {
    if (this.draggingNodeId) {
      const sprite = this.nodeSprites.get(this.draggingNodeId);
      if (sprite) {
        const dx = (e.global.x - this.lastPointer.x) / this.camera.scale;
        const dy = (e.global.y - this.lastPointer.y) / this.camera.scale;
        sprite.container.x += dx;
        sprite.container.y += dy;
        this.lastPointer = { x: e.global.x, y: e.global.y };
        this.edgesDirty = true;
      }
      return;
    }
    if (!this.isPanning) return;
    const dx = e.global.x - this.lastPointer.x;
    const dy = e.global.y - this.lastPointer.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) this.panMoved = true;
    this.camera.x -= dx / this.camera.scale;
    this.camera.y -= dy / this.camera.scale;
    this.lastPointer = { x: e.global.x, y: e.global.y };
    this.flyAnimation = null;
    this.applyCameraToWorld();
    this.updateVisibility();
  };

  private onStagePointerUp = () => {
    if (this.draggingNodeId) {
      const sprite = this.nodeSprites.get(this.draggingNodeId);
      if (sprite) {
        Object.assign(sprite.node, { x: sprite.container.x, y: sprite.container.y });
        this.callbacks.onNodeDragEnd(this.draggingNodeId, sprite.container.x, sprite.container.y);
      }
      this.draggingNodeId = null;
      return;
    }
    if (this.isPanning && !this.panMoved) {
      this.callbacks.onBackgroundClick();
    }
    this.isPanning = false;
  };

  private onNodePointerDown = (e: import("pixi.js").FederatedPointerEvent, nodeId: string) => {
    e.stopPropagation();
    if (this.editorMode) {
      this.draggingNodeId = nodeId;
      this.lastPointer = { x: e.global.x, y: e.global.y };
      const sprite = this.nodeSprites.get(nodeId);
      if (sprite) sprite.container.cursor = "grabbing";
    } else {
      this.lastPointer = { x: e.global.x, y: e.global.y };
    }
  };

  private onNodePointerUp = (nodeId: string) => {
    if (this.editorMode) {
      const sprite = this.nodeSprites.get(nodeId);
      if (sprite) sprite.container.cursor = "grab";
      return;
    }
    this.callbacks.onNodeClick(nodeId);
    const now = performance.now();
    if (this.lastClickId === nodeId && now - this.lastClickTime < 350) {
      this.callbacks.onNodeDoubleClick(nodeId);
      this.lastClickId = null;
    } else {
      this.lastClickId = nodeId;
      this.lastClickTime = now;
    }
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const rect = this.app.canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const factor = Math.pow(1.0015, -e.deltaY);
    this.zoomAtScreenPoint(px, py, factor);
  };

  private zoomAtScreenPoint(screenX: number, screenY: number, factor: number) {
    this.flyAnimation = null;
    const before = this.screenToWorld(screenX, screenY);
    this.camera.scale = clamp(this.camera.scale * factor, ZOOM.MIN, ZOOM.MAX);
    const after = this.screenToWorld(screenX, screenY);
    this.camera.x += before.x - after.x;
    this.camera.y += before.y - after.y;
    this.applyCameraToWorld();
    this.updateVisibility();
  }

  private screenToWorld(screenX: number, screenY: number) {
    const cx = this.app.screen.width / 2;
    const cy = this.app.screen.height / 2;
    return {
      x: this.camera.x + (screenX - cx) / this.camera.scale,
      y: this.camera.y + (screenY - cy) / this.camera.scale,
    };
  }

  // ---- rendering loop --------------------------------------------------

  private onTick = () => {
    const deltaMs = this.app.ticker.deltaMS;

    if (this.flyAnimation) {
      const t = clamp(
        (performance.now() - this.flyAnimation.startTime) / this.flyAnimation.duration,
        0,
        1
      );
      const eased = easeOutCubic(t);
      this.camera.x =
        this.flyAnimation.startX + (this.flyAnimation.targetX - this.flyAnimation.startX) * eased;
      this.camera.y =
        this.flyAnimation.startY + (this.flyAnimation.targetY - this.flyAnimation.startY) * eased;
      this.camera.scale =
        this.flyAnimation.startScale +
        (this.flyAnimation.targetScale - this.flyAnimation.startScale) * eased;
      this.applyCameraToWorld();
      this.updateVisibility();
      if (t >= 1) this.flyAnimation = null;
    }

    if (this.starfield) this.starfield.update(this.camera.x, this.camera.y, deltaMs);

    if (this.edgesDirty) {
      const positions = new Map<string, { x: number; y: number }>();
      for (const [id, sprite] of this.nodeSprites)
        positions.set(id, { x: sprite.container.x, y: sprite.container.y });
      drawEdges(this.edgesLayer, this.edges, positions, {
        selectedNodeId: this.selectedNodeId,
        connectedEdgeIds: this.connectedEdgeIds,
        hasSelection: this.selectedNodeId != null,
      });
      this.edgesLayer.alpha = zoomLevelFor(this.camera.scale) === "far" ? 0.35 : 1;
      this.edgesDirty = false;
    }

    const now = performance.now();
    if (now - this.lastZoomEmit > 100) {
      this.lastZoomEmit = now;
      this.callbacks.onZoomChange(this.camera.scale, zoomLevelFor(this.camera.scale));
    }
  };

  private applyCameraToWorld() {
    const cx = this.app.screen.width / 2;
    const cy = this.app.screen.height / 2;
    this.world.scale.set(this.camera.scale);
    this.world.x = cx - this.camera.x * this.camera.scale;
    this.world.y = cy - this.camera.y * this.camera.scale;
  }

  private updateVisibility() {
    const scale = this.camera.scale;
    const zoomLevel = zoomLevelFor(scale);
    const halfW = this.app.screen.width / 2 / scale + 300;
    const halfH = this.app.screen.height / 2 / scale + 300;
    const left = this.camera.x - halfW;
    const right = this.camera.x + halfW;
    const top = this.camera.y - halfH;
    const bottom = this.camera.y + halfH;
    const inverseScale = clamp(1 / scale, 0.5, 3.5);

    for (const [id, sprite] of this.nodeSprites) {
      const inView =
        sprite.container.x >= left &&
        sprite.container.x <= right &&
        sprite.container.y >= top &&
        sprite.container.y <= bottom;
      sprite.container.visible = inView;
      if (inView) {
        sprite.setLabelVisibility(
          zoomLevel,
          id === this.selectedNodeId,
          this.connectedNodeIds.has(id)
        );
        sprite.setLabelScale(inverseScale);
      }
    }

    const domainInverseScale = clamp(1 / scale, 1.2, 8);
    const domainAlpha = zoomLevel === "far" ? 1 : zoomLevel === "medium" ? 0.35 : 0.08;
    for (const { text } of this.domainLabelTexts) {
      text.scale.set(domainInverseScale * 0.6);
      text.alpha = domainAlpha;
    }

    this.edgesLayer.alpha = zoomLevel === "far" ? 0.35 : 1;
  }
}
