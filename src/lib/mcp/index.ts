import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfile from "./tools/get-profile";
import listProducts from "./tools/list-products";
import listContent from "./tools/list-content";
import listCalendar from "./tools/list-calendar";

// Construct the OAuth issuer from the project ref (inlined by Vite at build time).
// Never derive it from SUPABASE_URL — the Lovable Cloud proxy host mismatches
// the direct supabase.co issuer that discovery advertises.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "nutrisales-os-mcp",
  title: "NutriSales OS",
  version: "0.1.0",
  instructions:
    "Read-only access to the signed-in nutritionist's NutriSales OS workspace: profile & brand, products/offers, generated content library, and content planner calendar. Use `get_profile` for niche/persona context, `list_products` for the offer ladder, `list_content` to search past AI generations, and `list_calendar` for scheduled posts.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfile, listProducts, listContent, listCalendar],
});
