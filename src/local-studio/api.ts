// Contract used by the actual Nexus Local Studio Assistant component.
export const BASE = "/local-studio";
let context: any = {};
export function configureStudio(value: any) {
  context = value;
}
export const snapshotStudio = () => ({ ...context });
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
  fixedContext?: any,
): Promise<T> {
  const scope = fixedContext || context;
  const payload =
    path === "/api/chat"
      ? {
          ...(body as object),
          language: scope.language,
          planning: scope.planning,
          mode: scope.mode,
        }
      : body;
  const response = await fetch(BASE + path, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      response.status >= 500
        ? context.unavailable || "Local Studio unavailable"
        : data.detail || context.unavailable || "Local Studio unavailable",
    );
  return data;
}
export type Model = {
  id: string;
  label: string;
  kind: string;
  available?: boolean;
};
export type Message = {
  role: string;
  content: string;
  remote?: boolean;
  references?: { id: string; title: string; href: string; page?: number }[];
};
export type Thread = {
  id: string;
  title: string;
  messages: Message[];
  active_job: string | null;
};
export type Job = {
  id: string;
  kind: string;
  model: string;
  status: string;
  partial: string;
  error: string | null;
  position: number | null;
  prompt: string;
  conversation_id: string | null;
  result: null | { content?: string; finish_reason?: string };
};
export const pending = (job?: Job | null) =>
  Boolean(job && ["queued", "waiting_gpu", "running"].includes(job.status));
export const statusLabel = (job: Job, t: any) =>
  ({
    queued: t.jobQueued,
    waiting_gpu: t.jobQueued,
    running: t.aiWorking,
    completed: t.jobCompleted,
    cancelled: t.jobCancelled,
    failed: t.jobFailed,
  })[job.status] || job.status;
