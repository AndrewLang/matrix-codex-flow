import { CodexCliProvider } from './agent.codex.provider';
import {
    AgentCapabilities,
    AgentConfig,
    AgentProvider,
    AgentRequest,
    AgentResponse,
    EMPTY_AGENT_RESULT,
} from './agent.provider';

export interface AgentProviderViewModel {
    id: string;
    name: string;
    type: string;
    defaultModel: string;
    isDefault: boolean;
}

export interface AgentConfigViewModel extends AgentConfig {
    isExpanded?: boolean;
    isSelected?: boolean;
}

export class AgentProviderNames {
    static ID_OPENAI = 'id_openai';
    static ID_CODEX_CLI = 'id_codex_cli';
    static ID_GEMINI = 'id_gemini';
    static ID_KARA = 'id_kara';

    static OPENAI = 'OpenAI';
    static CODEX_CLI = 'Codex CLI';
    static GEMINI = 'Gemini';
    static KARA = 'Kara';
}

export class AgentProviderRegistry {
    private static readonly AVAILABLE_PROVIDERS: AgentProviderViewModel[] = [
        {
            id: AgentProviderNames.ID_CODEX_CLI,
            name: AgentProviderNames.CODEX_CLI,
            type: 'codex-cli',
            defaultModel: 'gpt-5-codex',
            isDefault: true,
        },
        {
            id: AgentProviderNames.ID_OPENAI,
            name: AgentProviderNames.OPENAI,
            type: 'openai',
            defaultModel: 'gpt-5-codex',
            isDefault: false,
        },
        {
            id: AgentProviderNames.ID_GEMINI,
            name: AgentProviderNames.GEMINI,
            type: 'gemini',
            defaultModel: 'gemini-2.5-pro',
            isDefault: false,
        },
        {
            id: AgentProviderNames.ID_KARA,
            name: AgentProviderNames.KARA,
            type: 'kara',
            defaultModel: 'kara-default',
            isDefault: false,
        },
    ];

    static availableAgents(): AgentProviderViewModel[] {
        return this.AVAILABLE_PROVIDERS.map((provider) => ({ ...provider }));
    }

    static findAvailableAgentByType(type: string): AgentProviderViewModel | undefined {
        return this.AVAILABLE_PROVIDERS.find((provider) => provider.type === type);
    }

    static create(config: AgentConfig): AgentProvider {
        switch (config.agentType) {
            case 'openai':
                return new OpenAIProvider(config);
            case 'codex-cli':
                return new CodexCliProvider(config);
            case 'gemini':
                return new GeminiProvider(config);
            case 'kara':
                return new KaraProvider(config);
            default:
                throw new Error(`Unsupported provider type: ${config.agentType}`);
        }
    }
}

export class OpenAIProvider implements AgentProvider {
    readonly id = AgentProviderNames.ID_OPENAI;
    readonly name = AgentProviderNames.OPENAI;
    readonly capabilities: AgentCapabilities = {
        supportsStreaming: true,
        supportsJsonMode: true,
        supportsTools: true,
        canModifyFiles: true,
        canExecuteShell: true,
    };

    constructor(private config: AgentConfig) { }

    get model() {
        return this.config.model;
    }

    async run(request: AgentRequest): Promise<AgentResponse> {
        const start = Date.now();

        const response = await fetch(`${this.config.baseUrl}/v1/responses`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.model,
                input: request.prompt,
                temperature: request.temperature,
            }),
        });

        const data = await response.json();

        return {
            text: data.output_text,
            raw: data,
            durationMs: Date.now() - start,
        };
    }
}


export class GeminiProvider implements AgentProvider {
    readonly id = AgentProviderNames.ID_GEMINI;
    readonly name = AgentProviderNames.GEMINI;
    readonly capabilities: AgentCapabilities = {
        supportsStreaming: true,
        supportsJsonMode: true,
        supportsTools: true,
    };

    constructor(private config: AgentConfig) { }

    get model() {
        return this.config.model;
    }

    async run(request: AgentRequest): Promise<AgentResponse> {
        const start = Date.now();

        const args = ['exec', '--model', this.model, request.prompt];

        const result = await this.runProcess('codex', args);

        return {
            text: result.text,
            raw: result,
            durationMs: Date.now() - start,
        };
    }

    private async runProcess(cmd: string, args: string[]): Promise<AgentResponse> {
        return EMPTY_AGENT_RESULT;
    }
}

export class KaraProvider implements AgentProvider {
    readonly id = AgentProviderNames.ID_KARA;
    readonly name = AgentProviderNames.KARA;
    readonly capabilities: AgentCapabilities = {
        supportsStreaming: true,
        supportsJsonMode: true,
        supportsTools: true,
    };

    constructor(private config: AgentConfig) { }

    get model() {
        return this.config.model;
    }

    async run(request: AgentRequest): Promise<AgentResponse> {
        await new Promise(r => setTimeout(r, 1000));

        const start = Date.now();

        return {
            text: `Echo from Kara: ${request.prompt}`,
            raw: null,
            durationMs: Date.now() - start,
        };
    }

    async runStream?(request: AgentRequest, onChunk: (chunk: AgentResponse) => void): Promise<void> {
        for (let i = 0; i < 10; i++) {
            await new Promise(r => setTimeout(r, 1000));

            const chunk: AgentResponse = {
                text: `Chunk ${i + 1} from Kara: ${request.prompt}`,
                raw: null,
                durationMs: 1000,
            };

            onChunk(chunk);
        }
    }
}
