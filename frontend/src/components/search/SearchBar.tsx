import { useMemo, useState } from "react";
import { useUniverseStore } from "../../state/store";
import { searchNodes } from "../../utils/search";
import type { UniverseNode } from "@moodle-universum/shared";

const TYPE_LABEL: Record<string, string> = {
  course: "Course",
  knowledge: "Knowledge",
  technology: "Technology",
  domain: "Domain",
};

export function SearchBar() {
  const nodes = useUniverseStore((s) => s.nodes);
  const domains = useUniverseStore((s) => s.domains);
  const query = useUniverseStore((s) => s.searchQuery);
  const setQuery = useUniverseStore((s) => s.setSearchQuery);
  const requestFlyTo = useUniverseStore((s) => s.requestFlyTo);
  const [focused, setFocused] = useState(false);

  const domainNameByKey = useMemo(() => new Map(domains.map((d) => [d.key, d.name])), [domains]);

  const results = useMemo(() => searchNodes(nodes, query), [nodes, query]);

  const handleSelect = (node: UniverseNode) => {
    requestFlyTo(node.id);
    setQuery("");
    setFocused(false);
  };

  const showDropdown = focused && results.length > 0;

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search courses, technologies, knowledge topics..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results[0]) handleSelect(results[0]);
          if (e.key === "Escape") (e.target as HTMLInputElement).blur();
        }}
        aria-label="Search the IT universe"
      />
      {showDropdown && (
        <ul className="search-results">
          {results.map((node) => (
            <li key={node.id}>
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleSelect(node)}>
                <span className="search-result-name">{node.name}</span>
                <span className="search-result-meta">
                  {TYPE_LABEL[node.type]}
                  {node.domain ? ` · ${domainNameByKey.get(node.domain) ?? node.domain}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
