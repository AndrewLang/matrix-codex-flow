use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TaskStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TaskStepType {
    Normal,
    Post,
    Pre,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskStep {
    pub id: String,
    pub title: String,
    pub content: String,
    pub status: TaskStatus,
    pub created_at: i64,
    pub updated_at: i64,
    pub r#type: TaskStepType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    pub id: String,
    pub project_id: String,
    pub title: String,
    pub description: String,
    pub steps: Vec<TaskStep>,
    pub presteps: Vec<TaskStep>,
    pub poststeps: Vec<TaskStep>,
    pub status: TaskStatus,
    pub created_at: i64,
    pub updated_at: i64,
}
