export type AssistantActionType =
  | "open_calendar"
  | "create_content"
  | "create_calendar_item"
  | "open_offers";

export interface AssistantAction {
  type: AssistantActionType;
  label: string;
  payload?: {
    date?: string;
    format?: "carrossel" | "reels" | "post_unico" | "stories";
    title?: string;
    notes?: string;
    content?: string;
  };
}

const ACTION_BLOCK = /<!--ASSISTANT_ACTIONS\s*([\s\S]*?)\s*-->/i;
const ACTION_TYPES = new Set<AssistantActionType>([
  "open_calendar",
  "create_content",
  "create_calendar_item",
  "open_offers",
]);
const FORMATS = new Set(["carrossel", "reels", "post_unico", "stories"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanAction(value: unknown): AssistantAction | null {
  if (!isRecord(value) || typeof value.type !== "string" || !ACTION_TYPES.has(value.type as AssistantActionType)) return null;
  if (typeof value.label !== "string" || !value.label.trim()) return null;

  const payload = isRecord(value.payload) ? value.payload : undefined;
  const normalizedPayload = payload
    ? {
        date: typeof payload.date === "string" ? payload.date : undefined,
        format: typeof payload.format === "string" && FORMATS.has(payload.format) ? payload.format as AssistantAction["payload"]["format"] : undefined,
        title: typeof payload.title === "string" ? payload.title : undefined,
        notes: typeof payload.notes === "string" ? payload.notes : undefined,
        content: typeof payload.content === "string" ? payload.content : undefined,
      }
    : undefined;

  return { type: value.type as AssistantActionType, label: value.label.trim(), payload: normalizedPayload };
}

export function parseAssistantActions(content: string): { content: string; actions: AssistantAction[] } {
  const match = content.match(ACTION_BLOCK);
  if (!match) return { content, actions: [] };

  try {
    const parsed = JSON.parse(match[1]);
    const actions = Array.isArray(parsed) ? parsed.map(cleanAction).filter((action): action is AssistantAction => action !== null).slice(0, 3) : [];
    return { content: content.replace(match[0], "").trim(), actions };
  } catch {
    return { content: content.replace(match[0], "").trim(), actions: [] };
  }
}
