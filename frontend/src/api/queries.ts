import type {
  CreateEdgeInput,
  CreateNodeInput,
  DomainsResponse,
  LayoutUpdateInput,
  MeResponse,
  UniverseResponse,
  UpdateNodeInput,
} from "@moodle-universum/shared";
import { api } from "./client";

export const queries = {
  getMe: () => api.get<MeResponse>("/me"),
  getUniverse: () => api.get<UniverseResponse>("/universe"),
  getDomains: () => api.get<DomainsResponse>("/domains"),

  createNode: (input: CreateNodeInput) => api.post<{ id: string }>("/admin/nodes", input),
  updateNode: (id: string, input: UpdateNodeInput) => api.patch<void>(`/admin/nodes/${id}`, input),
  deleteNode: (id: string) => api.delete<void>(`/admin/nodes/${id}`),

  createEdge: (input: CreateEdgeInput) => api.post<{ id: string }>("/admin/edges", input),
  deleteEdge: (id: string) => api.delete<void>(`/admin/edges/${id}`),

  updateLayout: (input: LayoutUpdateInput) => api.patch<void>("/admin/layout", input),
};
