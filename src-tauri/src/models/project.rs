use serde::{Deserialize, Serialize};

use super::agent_rule::AgentRule;
use super::task::Task;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: String,
    pub rules: Vec<AgentRule>,
    pub tasks: Vec<Task>,
    pub created_at: i64,
    pub updated_at: i64,
}
