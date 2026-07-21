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
  name: "list_content",
  title: "List generated content",
  description:
    "List the user's AI-generated content pieces (posts, carousels, strategies) from the library. Filter by type or favorites.",
  inputSchema: {
    tipo: z
      .string()
      .optional()
      .describe("Optional content type filter, e.g. 'post', 'carousel', 'strategy'."),
    only_favorites: z.boolean().optional().describe("Return only favorited items."),
    limit: z.number().int().min(1).max(100).optional().describe("Max results (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ tipo, only_favorites, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let q = supabaseForUser(ctx)
      .from("generations")
      .select("id, tipo, subtipo, specialist, titulo, tags, favorito, output_content, created_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (tipo) q = q.eq("tipo", tipo);
    if (only_favorites) q = q.eq("favorito", true);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { items: data ?? [] },
    };
  },
});
