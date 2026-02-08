import { Injectable, computed, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

import { SettingModel } from '../models/setting.model';

const SETTINGS_STORAGE_KEY = 'vibeflowSettings';
const AGENT_SETTING_KEY = 'agent.provider';
const CODEX_API_KEY_SETTING_KEY = 'agent.codex.apiKey';
const AGENT_MODEL_SETTING_KEY = 'agent.model';
const PROMPT_TEMPLATE_SETTING_KEY = 'prompt.template';
const GENERATE_FOLDER_SETTING_KEY = 'project.generateVibeflowFolder';
const AGENT_SETTING_ID = 'setting-agent-provider';
const CODEX_API_KEY_SETTING_ID = 'setting-agent-codex-api-key';
const AGENT_MODEL_SETTING_ID = 'setting-agent-model';
const PROMPT_TEMPLATE_SETTING_ID = 'setting-prompt-template';
const GENERATE_FOLDER_SETTING_ID = 'setting-generate-folder';
const CODEX_AGENT_VALUE = 'codex';
const DEFAULT_AGENT_MODEL = 'gpt-5-codex';
const DEFAULT_PROMPT_TEMPLATE = `You are Codex working inside VibeFlow.
Follow project context and rules, keep outputs concise, and produce actionable steps.`;

const DEFAULT_SETTINGS: SettingModel[] = [
    {
        id: AGENT_SETTING_ID,
        key: AGENT_SETTING_KEY,
        value: CODEX_AGENT_VALUE,
        valueType: 'string'
    },
    {
        id: CODEX_API_KEY_SETTING_ID,
        key: CODEX_API_KEY_SETTING_KEY,
        value: '',
        valueType: 'string'
    },
    {
        id: AGENT_MODEL_SETTING_ID,
        key: AGENT_MODEL_SETTING_KEY,
        value: DEFAULT_AGENT_MODEL,
        valueType: 'string'
    },
    {
        id: PROMPT_TEMPLATE_SETTING_ID,
        key: PROMPT_TEMPLATE_SETTING_KEY,
        value: DEFAULT_PROMPT_TEMPLATE,
        valueType: 'string'
    },
    {
        id: GENERATE_FOLDER_SETTING_ID,
        key: GENERATE_FOLDER_SETTING_KEY,
        value: true,
        valueType: 'boolean'
    }
];

@Injectable({ providedIn: 'root' })
export class SettingService {
    private readonly settingsState = signal<SettingModel[]>(this.loadSettings());

    readonly settings = this.settingsState.asReadonly();
    readonly agentProvider = computed(() => this.getStringSetting(AGENT_SETTING_KEY, CODEX_AGENT_VALUE));
    readonly codexApiKey = computed(() => this.getStringSetting(CODEX_API_KEY_SETTING_KEY, ''));
    readonly agentModel = computed(() => this.getStringSetting(AGENT_MODEL_SETTING_KEY, DEFAULT_AGENT_MODEL));
    readonly promptTemplate = computed(() => this.getStringSetting(PROMPT_TEMPLATE_SETTING_KEY, DEFAULT_PROMPT_TEMPLATE));
    readonly generateVibeflowFolder = computed(() => this.getBooleanSetting(GENERATE_FOLDER_SETTING_KEY, true));

    constructor() {
        void this.loadFromBackend();
    }

    updateSettingValue(key: string, value: string | boolean | number): void {
        this.settingsState.update((settings) =>
            settings.map((setting) =>
                setting.key === key
                    ? {
                        ...setting,
                        value
                    }
                    : setting
            )
        );
        void this.persistSettings();
    }

    resetSettings(): void {
        this.settingsState.set(DEFAULT_SETTINGS.map((setting) => ({ ...setting })));
        void this.persistSettings();
    }

    private getStringSetting(key: string, fallbackValue: string): string {
        const matchingSetting = this.settingsState().find((setting) => setting.key === key);
        return typeof matchingSetting?.value === 'string' ? matchingSetting.value : fallbackValue;
    }

    private getBooleanSetting(key: string, fallbackValue: boolean): boolean {
        const matchingSetting = this.settingsState().find((setting) => setting.key === key);
        return typeof matchingSetting?.value === 'boolean' ? matchingSetting.value : fallbackValue;
    }

    private loadSettings(): SettingModel[] {
        const serializedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

        if (!serializedSettings) {
            return DEFAULT_SETTINGS.map((setting) => ({ ...setting }));
        }

        try {
            const parsedValue: unknown = JSON.parse(serializedSettings);

            if (!Array.isArray(parsedValue)) {
                return DEFAULT_SETTINGS.map((setting) => ({ ...setting }));
            }

            const parsedSettings = parsedValue.filter(this.isSettingModel);
            if (parsedSettings.length === 0) {
                return DEFAULT_SETTINGS.map((setting) => ({ ...setting }));
            }

            return DEFAULT_SETTINGS.map((defaultSetting) => {
                const matchingSetting = parsedSettings.find((setting) => setting.key === defaultSetting.key);

                if (!matchingSetting) {
                    return { ...defaultSetting };
                }

                if (defaultSetting.valueType === 'boolean' && typeof matchingSetting.value === 'boolean') {
                    return { ...defaultSetting, value: matchingSetting.value };
                }

                if (defaultSetting.valueType === 'string' && typeof matchingSetting.value === 'string') {
                    return { ...defaultSetting, value: matchingSetting.value };
                }

                if (defaultSetting.valueType === 'number' && typeof matchingSetting.value === 'number') {
                    return { ...defaultSetting, value: matchingSetting.value };
                }

                return { ...defaultSetting };
            });
        } catch {
            return DEFAULT_SETTINGS.map((setting) => ({ ...setting }));
        }
    }

    private async loadFromBackend(): Promise<void> {
        try {
            const backendSettings = await invoke<SettingModel[]>('load_settings');
            const mergedSettings = this.mergeWithDefaults(backendSettings);
            this.settingsState.set(mergedSettings);
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(mergedSettings));
        } catch {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settingsState()));
        }
    }

    private async persistSettings(): Promise<void> {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settingsState()));

        try {
            await invoke('save_settings', { settings: this.settingsState() });
        } catch {
            return;
        }
    }

    private isSettingModel(value: unknown): value is SettingModel {
        if (!value || typeof value !== 'object') {
            return false;
        }

        const candidate = value as Partial<SettingModel>;
        const hasValidValueType =
            candidate.valueType === 'string' || candidate.valueType === 'boolean' || candidate.valueType === 'number';
        const hasValidValue =
            typeof candidate.value === 'string' || typeof candidate.value === 'boolean' || typeof candidate.value === 'number';

        return (
            typeof candidate.id === 'string' &&
            typeof candidate.key === 'string' &&
            hasValidValueType &&
            hasValidValue
        );
    }

    private mergeWithDefaults(settings: SettingModel[]): SettingModel[] {
        if (settings.length === 0) {
            return DEFAULT_SETTINGS.map((setting) => ({ ...setting }));
        }

        return DEFAULT_SETTINGS.map((defaultSetting) => {
            const matchingSetting = settings.find((setting) => setting.key === defaultSetting.key);

            if (!matchingSetting) {
                return { ...defaultSetting };
            }

            if (defaultSetting.valueType === 'string' && typeof matchingSetting.value === 'string') {
                return { ...defaultSetting, value: matchingSetting.value };
            }

            if (defaultSetting.valueType === 'boolean' && typeof matchingSetting.value === 'boolean') {
                return { ...defaultSetting, value: matchingSetting.value };
            }

            if (defaultSetting.valueType === 'number' && typeof matchingSetting.value === 'number') {
                return { ...defaultSetting, value: matchingSetting.value };
            }

            return { ...defaultSetting };
        });
    }
}
