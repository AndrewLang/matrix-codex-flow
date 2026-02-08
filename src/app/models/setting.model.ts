export type SettingValueType = 'string' | 'boolean' | 'number';

export interface SettingModel {
    id: string;
    key: string;
    value: string | boolean | number;
    valueType: SettingValueType;
}
