use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SettingValueType {
    String,
    Boolean,
    Number,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum SettingValue {
    String(String),
    Boolean(bool),
    Number(f64),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingModel {
    pub id: String,
    pub key: String,
    pub value: SettingValue,
    pub value_type: SettingValueType,
}
