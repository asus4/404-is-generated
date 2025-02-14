import {
    GenerativeModel,
    GoogleGenerativeAI
} from "@google/generative-ai";
import { OpenAI } from "openai";

// Abstract LLM client which supports the both Gemini and OpenAI

export interface ILlmClient {
    generateText(systemPrompt: string, userPrompt: string): Promise<string>;
    streamText(systemPrompt: string, userPrompt: string): AsyncGenerator<string>;
    generateImage(prompt: string): Promise<HTMLImageElement>;
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
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        const genAI = new GoogleGenerativeAI(apiKey!);
        genAI.getGenerativeModel
        this.model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
        });
    }

    async generateText(systemPrompt: string, userPrompt: string): Promise<string> {
        const prompt = `${systemPrompt}\n${userPrompt}`;
        const result = await this.model.generateContent([prompt]);
        return result.response.text();
    }

    async * streamText(systemPrompt: string, userPrompt: string): AsyncGenerator<string> {
        const prompt = `${systemPrompt}\n${userPrompt}`;
        const result = await this.model.generateContentStream([prompt]);
        for await (const chunk of result.stream) {
            yield chunk.text();
        }
    }

    async generateImage(prompt: string): Promise<HTMLImageElement> {
        const modelName = "imagen-3.0-generate-002";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict`;
        const headers = {
            "Content-Type": "application/json",
        };
        const data = {
            instances: [{ prompt, },
            ],
            parameters: {
                sampleCount: 1,
                personGeneration: "allow_adult",
                aspectRatio: "1:1",
            },
        }

        const response = await fetch(`${url}?key=${this.apiKey}`, {
            method: "POST",
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error generating image: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        const prediction = result.predictions[0];
        const img = new Image();
        img.src = `data:${prediction.mimeType};base64,${prediction.bytesBase64Encoded}`;
        return img;
    }
}

class OpenAIClient implements ILlmClient {
    private client: OpenAI;

    constructor(apiKey: string) {
        this.client = new OpenAI({
            apiKey,
            dangerouslyAllowBrowser: true,
        });
    }

    async generateText(systemPrompt: string, userPrompt: string): Promise<string> {
        const response = await this.client.chat.completions.create({
            model: "o3-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
        });
        return response.choices[0].message.content!;
    }

    async generateImage(prompt: string): Promise<HTMLImageElement> {
        throw new Error("Not implemented.");
    }

    async * streamText(systemPrompt: string, userPrompt: string): AsyncGenerator<string> {
        throw new Error("Not implemented.");
    }
}
