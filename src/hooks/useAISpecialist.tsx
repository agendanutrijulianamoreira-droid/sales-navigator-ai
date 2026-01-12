import { useState, useCallback } from "react";
import { useProfile } from "./useProfile";
import { useProducts } from "./useProducts";

type Specialist = 
  | "COMMAND_CENTER"
  | "BRAND_ARCHITECT"
  | "SOCIAL_MEDIA_MANAGER"
  | "GROWTH_STRATEGIST"
  | "MATERIAL_COPYWRITER"
  | "CHALLENGE_COACH"
  | "VIP_CLOSER"
  | "CFO_STRATEGIST"
  | "MENTOR_ORCHESTRATOR";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useAISpecialist() {
  const { profile } = useProfile();
  const { products } = useProducts();
  const [isLoading, setIsLoading] = useState(false);

  const streamResponse = useCallback(async (
    specialist: Specialist,
    prompt: string,
    conversationHistory: Message[] = [],
    onDelta: (delta: string) => void,
    onDone: () => void
  ) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-specialist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          specialist,
          prompt,
          profile,
          products,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch { /* ignore */ }
        }
      }

      onDone();
    } catch (error) {
      console.error("AI Specialist error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [profile, products]);

  const routeToSpecialist = useCallback(async (query: string): Promise<Specialist> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-router`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        return "MENTOR_ORCHESTRATOR";
      }

      const data = await response.json();
      return data.specialist || "MENTOR_ORCHESTRATOR";
    } catch {
      return "MENTOR_ORCHESTRATOR";
    }
  }, []);

  return { streamResponse, routeToSpecialist, isLoading };
}
