import { useStrategyContext } from "./useStrategyContext";

export interface PricingAdvice {
    label: string;
    suggestedMargin: number;
    prepTimeMultiplier: number;
    hourlyMultiplier: number;
    reasoning: string;
}

export function useMaestroPricing() {
    const { strategy } = useStrategyContext();

    const getAdvice = (): PricingAdvice | null => {
        if (!strategy || !strategy.niche) return null;

        const niche = strategy.niche.toLowerCase();
        const persona = strategy.persona?.toLowerCase() || "";

        // Lógica de análise de nicho (Simulando inteligência de mercado)
        const isClinical = niche.includes('endometriose') ||
            niche.includes('oncologia') ||
            niche.includes('doença') ||
            niche.includes('autoimune') ||
            niche.includes('hormonal') ||
            niche.includes('sop') ||
            niche.includes('gestante') ||
            niche.includes('diabetes');

        const isPremiumPersona = persona.includes('empreendedora') ||
            persona.includes('executiva') ||
            persona.includes('alta performance') ||
            persona.includes('elite') ||
            persona.includes('empresária') ||
            persona.includes('sucesso');

        if (isClinical && isPremiumPersona) {
            return {
                label: "Nicho de Alta Complexidade & Alto Valor",
                suggestedMargin: 50, // 50% de lucro
                prepTimeMultiplier: 1.5, // Exige 50% mais tempo de estudo/preparo
                hourlyMultiplier: 2.0, // A hora vale 2x a média de mercado
                reasoning: "Seu público tem alto poder aquisitivo e o problema que você resolve é crítico. Você não vende dieta, você vende a capacidade dela continuar liderando o negócio com saúde e energia."
            };
        }

        if (isClinical) {
            return {
                label: "Nicho Clínico Especializado",
                suggestedMargin: 35,
                prepTimeMultiplier: 1.3,
                hourlyMultiplier: 1.5,
                reasoning: "Casos clínicos exigem análise profunda de exames e protocolos densos. Sua margem deve cobrir esse tempo intelectual de bastidor."
            };
        }

        return {
            label: "Nicho Lifestyle / Estética",
            suggestedMargin: 25,
            prepTimeMultiplier: 1.1,
            hourlyMultiplier: 1.2,
            reasoning: "Nicho de alta rotatividade. Foque em volume e em criar uma escada de produtos digitais para complementar sua clínica."
        };
    };

    return { advice: getAdvice(), strategy };
}
