import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_calendar",
  title: "List calendar items",
  description:
    "List scheduled content in the user's content planner within an optional date range (ISO YYYY-MM-DD).",
  inputSchema: {
    from: z.string().optional().describe("Start date (YYYY-MM-DD), inclusive."),
    to: z.string().optional().describe("End date (YYYY-MM-DD), inclusive."),
    status: z.string().optional().describe("Optional status filter (e.g. 'draft', 'scheduled')."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ from, to, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let q = supabaseForUser(ctx)
      .from("calendar_items")
      .select("id, data, tipo, status, titulo, notas, generation_id, created_at")
      .eq("user_id", ctx.getUserId())
      .order("data", { ascending: true });
    if (from) q = q.gte("data", from);
    if (to) q = q.lte("data", to);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { items: data ?? [] },
    };
  },
});
