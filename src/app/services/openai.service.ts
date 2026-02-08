import { computed, Injectable, inject } from '@angular/core';

import OpenAI from 'openai';
import { SettingService } from './setting.service';

@Injectable({ providedIn: 'root' })
export class OpenaiService {
    private readonly settingService = inject(SettingService);
    private readonly apiKey = computed(() => this.settingService.codexApiKey().trim());
    private readonly model = computed(() => this.settingService.agentModel().trim() || 'gpt-5-codex');
    private client: OpenAI | null = null;
    private clientApiKey = '';

    async run(prompt: string): Promise<string> {
        let output = '';
        await this.runStreaming(prompt, (chunk) => {
            output += chunk;
        });
        return output;
    }

    async runStreaming(prompt: string, onChunk: (text: string) => void): Promise<void> {
        const apiKey = this.apiKey();
        const model = this.model();

        if (!apiKey) {
            throw new Error('Codex API key is not configured in settings.');
        }

        const client = this.getClient(apiKey);
        const stream = await client.responses.stream({
            model,
            input: prompt,
        });

        for await (const event of stream) {
            if (event.type === 'response.output_text.delta') {
                onChunk(event.delta);
            }
        }
    }

    private getClient(apiKey: string): OpenAI {
        if (!this.client || this.clientApiKey !== apiKey) {
            this.client = new OpenAI({ apiKey });
            this.clientApiKey = apiKey;
        }

        return this.client;
    }
}
