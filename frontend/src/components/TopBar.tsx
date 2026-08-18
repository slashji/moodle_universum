import { SearchBar } from "./search/SearchBar";
import { useUniverseStore } from "../state/store";
import { queries } from "../api/queries";

let newNodeCounter = 0;

export function TopBar() {
  const me = useUniverseStore((s) => s.me);
  const editorMode = useUniverseStore((s) => s.editorMode);
  const toggleEditorMode = useUniverseStore((s) => s.toggleEditorMode);
  const upsertNodeLocal = useUniverseStore((s) => s.upsertNodeLocal);
  const selectNode = useUniverseStore((s) => s.selectNode);
  const isAdmin = me?.role === "admin";

  async function handleAddNode() {
    newNodeCounter += 1;
    const name = `New Knowledge Node ${newNodeCounter}`;
    try {
      const { id } = await queries.createNode({
        type: "knowledge",
        name,
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
        size: 1,
        importance: 1,
      });
      upsertNodeLocal({
        id,
        type: "knowledge",
        name,
        description: null,
        domain: null,
        moodleCourseId: null,
        x: 0,
        y: 0,
        size: 1,
        importance: 1,
        completion: null,
        status: "not_started",
      });
      selectNode(id);
    } catch (err) {
      console.error("Failed to create node:", err);
    }
  }

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <div className="app-logo">
          <span className="app-logo-mark" />
          IT UNIVERSE
        </div>
      </div>
      <div className="top-bar-center">
        <SearchBar />
      </div>
      <div className="top-bar-right">
        {isAdmin && (
          <button
            className={`editor-toggle ${editorMode ? "active" : ""}`}
            onClick={toggleEditorMode}
            title="Toggle curriculum editor"
          >
            {editorMode ? "Editing" : "Editor mode"}
          </button>
        )}
        {isAdmin && editorMode && (
          <button
            className="add-node-button"
            onClick={handleAddNode}
            title="Add a new knowledge node"
          >
            + Node
          </button>
        )}
        {me && (
          <div className="profile-chip">
            <span className="profile-avatar">{me.user.fullname.charAt(0)}</span>
            <span className="profile-name">{me.user.fullname}</span>
          </div>
        )}
      </div>
    </div>
  );
}
