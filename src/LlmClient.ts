import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAI } from "openai";

// Abstract LLM client which supports the both Gemini and OpenAI

export interface ILlmClient {
    generate(systemPrompt: string, userPrompt: string): Promise<string>;
}

export function getLlmClient(apiKey: string): ILlmClient {
    if (apiKey.startsWith("sk-")) {
        return new OpenAIClient(apiKey);
    } else {
        return new GeminiClient(apiKey);
    }
}

class GeminiClient implements ILlmClient {
    private model: GenerativeModel;

    constructor(apiKey: string) {
        const genAI = new GoogleGenerativeAI(apiKey!);
        this.model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
        });
        console.log(this.model);
    }

    async generate(systemPrompt: string, userPrompt: string): Promise<string> {
        const prompt = `${systemPrompt}\n${userPrompt}`;
        const result = await this.model.generateContent([prompt]);
        return result.response.text();
    }
}

class OpenAIClient implements ILlmClient {
    private client: OpenAI;

    constructor(apiKey: string) {
        this.client = new OpenAI({
            apiKey,
            dangerouslyAllowBrowser: true,
        });
        console.log(this.client);
    }

    async generate(systemPrompt: string, userPrompt: string): Promise<string> {
        const response = await this.client.chat.completions.create({
            model: "o3-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
        });
        return response.choices[0].message.content!;
    }
}
