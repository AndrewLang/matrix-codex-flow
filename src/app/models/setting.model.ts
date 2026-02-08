export type SettingValueType = 'string' | 'boolean';

export interface SettingModel {
    id: string;
    key: string;
    value: string | boolean;
    valueType: SettingValueType;
}
