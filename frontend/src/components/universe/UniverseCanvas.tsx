import { useEffect, useRef } from "react";
import { useUniverseStore } from "../../state/store";
import { queries } from "../../api/queries";
import { UniverseRenderer } from "./UniverseRenderer";
import type { ZoomLevel } from "./NodeSprite";

export interface UniverseControls {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
}

interface UniverseCanvasProps {
  onZoomChange: (scale: number, level: ZoomLevel) => void;
  onReady: (controls: UniverseControls) => void;
}

export function UniverseCanvas({ onZoomChange, onReady }: UniverseCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<UniverseRenderer | null>(null);

  const nodes = useUniverseStore((s) => s.nodes);
  const edges = useUniverseStore((s) => s.edges);
  const domains = useUniverseStore((s) => s.domains);
  const selectedNodeId = useUniverseStore((s) => s.selectedNodeId);
  const editorMode = useUniverseStore((s) => s.editorMode);
  const flyToRequest = useUniverseStore((s) => s.flyToRequest);
  const selectNode = useUniverseStore((s) => s.selectNode);
  const clearFlyToRequest = useUniverseStore((s) => s.clearFlyToRequest);
  const updateNodePositionLocal = useUniverseStore((s) => s.updateNodePositionLocal);

  // init renderer once
  useEffect(() => {
    if (!containerRef.current) return;
    const renderer = new UniverseRenderer({
      onNodeClick: (id) => {
        const state = useUniverseStore.getState();
        if (state.editorMode && state.linkSourceId && state.linkSourceId !== id) {
          const sourceNodeId = state.linkSourceId;
          const type = state.linkEdgeType;
          state.setLinkSource(null);
          queries
            .createEdge({ sourceNodeId, targetNodeId: id, type })
            .then(({ id: edgeId }) => {
              useUniverseStore
                .getState()
                .addEdgeLocal({ id: edgeId, source: sourceNodeId, target: id, type, weight: 1 });
            })
            .catch((err) => console.error("Failed to create edge:", err));
          state.selectNode(id);
          return;
        }
        state.selectNode(id);
      },
      onNodeDoubleClick: (id) => rendererRef.current?.flyTo(id),
      onBackgroundClick: () => useUniverseStore.getState().selectNode(null),
      onNodeDragEnd: (id, x, y) => {
        updateNodePositionLocal(id, x, y);
        queries.updateLayout({ positions: [{ id, x, y }] }).catch((err) => {
          console.error("Failed to persist node position:", err);
        });
      },
      onZoomChange,
    });
    // rendererRef is only populated once init() resolves (see below) so
    // the other effects in this component — which call methods on
    // rendererRef.current — can't race the still-initializing Pixi app.
    let cancelled = false;
    renderer
      .init(containerRef.current)
      .then(() => {
        if (cancelled) return;
        rendererRef.current = renderer;
        const state = useUniverseStore.getState();
        if (state.nodes.length) renderer.setData(state.nodes, state.edges, state.domains);
        renderer.setSelection(state.selectedNodeId);
        renderer.setEditorMode(state.editorMode);
        onReady({
          zoomIn: () => renderer.zoomBy(1.4),
          zoomOut: () => renderer.zoomBy(1 / 1.4),
          reset: () => renderer.resetView(),
        });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("UniverseRenderer init failed:", err?.stack ?? err);
      });
    return () => {
      cancelled = true;
      renderer.destroy();
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (nodes.length) rendererRef.current?.setData(nodes, edges, domains);
  }, [nodes, edges, domains]);

  useEffect(() => {
    rendererRef.current?.setSelection(selectedNodeId);
  }, [selectedNodeId]);

  useEffect(() => {
    rendererRef.current?.setEditorMode(editorMode);
  }, [editorMode]);

  useEffect(() => {
    if (!flyToRequest) return;
    rendererRef.current?.flyTo(flyToRequest.nodeId);
    selectNode(flyToRequest.nodeId);
    clearFlyToRequest();
  }, [flyToRequest, selectNode, clearFlyToRequest]);

  return <div ref={containerRef} className="universe-canvas" />;
}
