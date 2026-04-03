import { NextRequest, NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';

type RequestBody = {
    prompt: string;
    systemPrompt?: string;
};

export async function POST(req: NextRequest) {
    const { prompt, systemPrompt } = (await req.json()) as RequestBody;

    const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620';
    const configuration = new Configuration({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    try {
        const response = await openai.createChatCompletion({
            model,
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
        });

        return NextResponse.json({
            generatedContent: response.data.choices[0]?.message.content,
        });
    } catch (error) {
        console.error('Error generating content:', error);
        return NextResponse.json({ error: 'Failed to generate content.' }, { status: 500 });
    }
}