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
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const stopStreaming = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  }, [abortController]);

  const streamResponse = useCallback(async (
    specialist: Specialist,
    prompt: string,
    conversationHistory: Message[] = [],
    onDelta: (delta: string) => void,
    onDone: () => void
  ) => {
    setIsLoading(true);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-specialist`;
      console.log("[AI-Specialist] Calling function:", functionUrl);

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        signal: controller.signal,
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
        if (response.status === 429) throw new Error("Muitas requisições. Tente em instantes.");
        if (response.status === 402) throw new Error("Créditos de IA esgotados.");
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      if (!response.body) throw new Error("Resposta vazia da IA");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        const lines = textBuffer.split("\n");
        // Keep the last incomplete line in the buffer
        textBuffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine.startsWith(":")) continue;
          if (!trimmedLine.startsWith("data: ")) continue;

          const jsonStr = trimmedLine.slice(6).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onDelta(content);
          } catch (e) {
            console.warn("Fragmento de JSON ignorado no stream:", jsonStr);
            // If parse fails, we wait for more context (already captured by textBuffer)
          }
        }
      }

      onDone();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log("Geração interrompida pelo usuário");
      } else {
        console.error("AI Specialist error:", error);
        throw error;
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
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

    let fullContent = "";

    await streamResponse(
      specialist,
      prompt,
      [],
      (delta) => {
        fullContent += delta;
        setStreamedContent(fullContent);
      },
      () => { }
    );

    return fullContent;
  }, [streamResponse]);

  const routeToSpecialist = useCallback(async (query: string): Promise<{ content: string; specialist: string }> => {
    setIsLoading(true);
    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-router`;
      console.log("[AI-Specialist] Calling router:", functionUrl);

      const routerResponse = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ query }),
      });

      let specialist: Specialist = "MENTOR_ORCHESTRATOR";
      if (routerResponse.ok) {
        const data = await routerResponse.json();
        specialist = data.specialist || "MENTOR_ORCHESTRATOR";
      }

      let fullContent = "";

      await streamResponse(
        specialist,
        query,
        [],
        (delta) => {
          fullContent += delta;
        },
        () => { }
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
    stopStreaming,
    isLoading,
    streamedContent
  };
}
