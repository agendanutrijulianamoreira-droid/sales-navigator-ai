import { useState, useCallback } from "react";
import { useProfile } from "./useProfile";
import { useProducts } from "./useProducts";

export type Specialist = 
  | "COMMAND_CENTER"
  | "BRAND_ARCHITECT"
  | "SOCIAL_MEDIA_MANAGER"
  | "GROWTH_STRATEGIST"
  | "MATERIAL_COPYWRITER"
  | "CHALLENGE_COACH"
  | "VIP_CLOSER"
  | "CFO_STRATEGIST"
  | "MENTOR_ORCHESTRATOR";

export interface Message {
  role: "user" | "assistant";
  content: string;
  specialist?: string;
}

// Map page specialist names to edge function specialist names
const specialistMap: Record<string, Specialist> = {
  brand_architect: "BRAND_ARCHITECT",
  social_media_manager: "SOCIAL_MEDIA_MANAGER",
  growth_strategist: "GROWTH_STRATEGIST",
  material_copywriter: "MATERIAL_COPYWRITER",
  challenge_coach: "CHALLENGE_COACH",
  vip_closer: "VIP_CLOSER",
  cfo_strategist: "CFO_STRATEGIST",
  mentor_orchestrator: "MENTOR_ORCHESTRATOR",
};

export function useAISpecialist() {
  const { profile } = useProfile();
  const { products } = useProducts();
  const [isLoading, setIsLoading] = useState(false);
  const [streamedContent, setStreamedContent] = useState<string>("");

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

  const generateContent = useCallback(async (
    specialistKey: string,
    subtipo: string,
    inputData: Record<string, any>
  ) => {
    const specialist = specialistMap[specialistKey] || "MENTOR_ORCHESTRATOR";
    const prompt = `Tipo: ${subtipo}\nDados: ${JSON.stringify(inputData, null, 2)}`;
    
    setStreamedContent("");
    setIsLoading(true);

    let fullContent = "";
    
    await streamResponse(
      specialist,
      prompt,
      [],
      (delta) => {
        fullContent += delta;
        setStreamedContent(fullContent);
      },
      () => {
        setIsLoading(false);
      }
    );

    return fullContent;
  }, [streamResponse]);

  const routeToSpecialist = useCallback(async (query: string): Promise<{ content: string; specialist: string }> => {
    setIsLoading(true);
    try {
      // First, get the right specialist
      const routerResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-router`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ query }),
      });

      let specialist: Specialist = "MENTOR_ORCHESTRATOR";
      if (routerResponse.ok) {
        const data = await routerResponse.json();
        specialist = data.specialist || "MENTOR_ORCHESTRATOR";
      }

      // Then get the response from that specialist
      let fullContent = "";
      
      await streamResponse(
        specialist,
        query,
        [],
        (delta) => {
          fullContent += delta;
        },
        () => {}
      );

      return { 
        content: fullContent, 
        specialist: specialist.toLowerCase() 
      };
    } catch (error) {
      console.error("Route to specialist error:", error);
      return { 
        content: "Desculpe, ocorreu um erro. Por favor, tente novamente.", 
        specialist: "mentor_orchestrator" 
      };
    } finally {
      setIsLoading(false);
    }
  }, [streamResponse]);

  return { 
    streamResponse, 
    generateContent, 
    routeToSpecialist, 
    isLoading, 
    streamedContent 
  };
}
