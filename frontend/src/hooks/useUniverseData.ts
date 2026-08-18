import { useEffect } from "react";
import { queries } from "../api/queries";
import { ApiError } from "../api/client";
import { useUniverseStore } from "../state/store";

export function useUniverseData() {
  const setLoading = useUniverseStore((s) => s.setLoading);
  const setLoaded = useUniverseStore((s) => s.setLoaded);
  const setError = useUniverseStore((s) => s.setError);
  const status = useUniverseStore((s) => s.status);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading();
      try {
        const [me, universe] = await Promise.all([queries.getMe(), queries.getUniverse()]);
        if (cancelled) return;
        setLoaded({
          me,
          nodes: universe.nodes,
          edges: universe.edges,
          domains: universe.domains,
          progress: universe.progress,
          moodleDegraded: universe.moodleStatus === "degraded",
        });
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? (err.body?.message ?? err.message)
            : "Could not reach the backend. Is it running?";
        setError(message);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status };
}
