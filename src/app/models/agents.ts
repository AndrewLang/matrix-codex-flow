import { AgentCapabilities, AgentConfig, AgentProvider, AgentRequest, AgentResponse, EMPTY_AGENT_RESULT } from "./agent.provider";

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

    static create(config: AgentConfig): AgentProvider {
        switch (config.type) {
            case 'openai':
                return new OpenAIProvider(config);
            case 'codex-cli':
                return new CodexCliProvider(config);
            case 'gemini':
                return new GeminiProvider(config);
            case 'kara':
                return new KaraProvider(config);
            default:
                throw new Error(`Unsupported provider type: ${config.type}`);
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
        canExecuteShell: true
    };

    constructor(
        private config: AgentConfig
    ) { }

    get model() {
        return this.config.model;
    }

    async run(request: AgentRequest): Promise<AgentResponse> {
        const start = Date.now();

        const response = await fetch(`${this.config.baseUrl}/v1/responses`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.model,
                input: request.prompt,
                temperature: request.temperature
            })
        });

        const data = await response.json();

        return {
            text: data.output_text,
            raw: data,
            durationMs: Date.now() - start
        };
    }
}

export class CodexCliProvider implements AgentProvider {
    readonly id = AgentProviderNames.ID_CODEX_CLI;
    readonly name = AgentProviderNames.CODEX_CLI;
    readonly capabilities: AgentCapabilities = {
        supportsStreaming: false,
        supportsJsonMode: true,
        supportsTools: true
    };

    constructor(private config: AgentConfig) { }

    get model() {
        return this.config.model;
    }

    async run(request: AgentRequest): Promise<AgentResponse> {
        const start = Date.now();

        const args = [
            'exec',
            '--model', this.model,
            request.prompt
        ];

        const result = await this.runProcess('codex', args);

        return {
            text: result.text,
            raw: result,
            durationMs: Date.now() - start
        };
    }

    private async runProcess(cmd: string, args: string[]): Promise<AgentResponse> {
        return EMPTY_AGENT_RESULT;
    }
}

export class GeminiProvider implements AgentProvider {
    readonly id = AgentProviderNames.ID_GEMINI;
    readonly name = AgentProviderNames.GEMINI;
    readonly capabilities: AgentCapabilities = {
        supportsStreaming: true,
        supportsJsonMode: true,
        supportsTools: true
    };

    constructor(private config: AgentConfig) { }

    get model() {
        return this.config.model;
    }

    async run(request: AgentRequest): Promise<AgentResponse> {
        const start = Date.now();

        const args = [
            'exec',
            '--model', this.model,
            request.prompt
        ];

        const result = await this.runProcess('codex', args);

        return {
            text: result.text,
            raw: result,
            durationMs: Date.now() - start
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
        supportsTools: true
    };

    constructor(private config: AgentConfig) { }

    get model() {
        return this.config.model;
    }

    async run(request: AgentRequest): Promise<AgentResponse> {
        const start = Date.now();

        const args = [
            'exec',
            '--model', this.model,
            request.prompt
        ];

        const result = await this.runProcess('codex', args);

        return {
            text: result.text,
            raw: result,
            durationMs: Date.now() - start
        };
    }

    private async runProcess(cmd: string, args: string[]): Promise<AgentResponse> {
        return EMPTY_AGENT_RESULT;
    }

}