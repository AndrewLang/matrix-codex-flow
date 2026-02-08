import { Injectable, computed, signal } from '@angular/core';

import { SettingModel } from '../models/setting.model';

const SETTINGS_STORAGE_KEY = 'vibeflowSettings';
const AGENT_SETTING_KEY = 'agent.provider';
const PROMPT_TEMPLATE_SETTING_KEY = 'prompt.template';
const GENERATE_FOLDER_SETTING_KEY = 'project.generateVibeflowFolder';
const AGENT_SETTING_ID = 'setting-agent-provider';
const PROMPT_TEMPLATE_SETTING_ID = 'setting-prompt-template';
const GENERATE_FOLDER_SETTING_ID = 'setting-generate-folder';
const CODEX_AGENT_VALUE = 'codex';
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
    readonly promptTemplate = computed(() => this.getStringSetting(PROMPT_TEMPLATE_SETTING_KEY, DEFAULT_PROMPT_TEMPLATE));
    readonly generateVibeflowFolder = computed(() => this.getBooleanSetting(GENERATE_FOLDER_SETTING_KEY, true));

    updateSettingValue(key: string, value: string | boolean): void {
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
        this.persistSettings();
    }

    resetSettings(): void {
        this.settingsState.set(DEFAULT_SETTINGS.map((setting) => ({ ...setting })));
        this.persistSettings();
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

                return { ...defaultSetting };
            });
        } catch {
            return DEFAULT_SETTINGS.map((setting) => ({ ...setting }));
        }
    }

    private persistSettings(): void {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settingsState()));
    }

    private isSettingModel(value: unknown): value is SettingModel {
        if (!value || typeof value !== 'object') {
            return false;
        }

        const candidate = value as Partial<SettingModel>;
        const hasValidValueType = candidate.valueType === 'string' || candidate.valueType === 'boolean';
        const hasValidValue =
            typeof candidate.value === 'string' || typeof candidate.value === 'boolean';

        return (
            typeof candidate.id === 'string' &&
            typeof candidate.key === 'string' &&
            hasValidValueType &&
            hasValidValue
        );
    }
}
