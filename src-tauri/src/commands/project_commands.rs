use std::sync::Mutex;

use tauri::State;

use crate::models::project::Project;
use crate::services::data_service::DataService;

#[tauri::command]
pub fn load_recent_projects(
    count: usize,
    data_service: State<'_, Mutex<DataService>>,
) -> Result<Vec<Project>, String> {
    let service = data_service
        .lock()
        .map_err(|error| format!("failed to lock data service: {error}"))?;

    service
        .get_recent_projects(count)
        .map_err(|error| format!("failed to load recent projects: {error}"))
}

#[tauri::command]
pub fn load_project(
    project_id: String,
    data_service: State<'_, Mutex<DataService>>,
) -> Result<Option<Project>, String> {
    let service = data_service
        .lock()
        .map_err(|error| format!("failed to lock data service: {error}"))?;

    service
        .load_project(&project_id)
        .map_err(|error| format!("failed to load project: {error}"))
}

#[tauri::command]
pub fn save_project(
    project: Project,
    data_service: State<'_, Mutex<DataService>>,
) -> Result<(), String> {
    let service = data_service
        .lock()
        .map_err(|error| format!("failed to lock data service: {error}"))?;

    service
        .upsert_project(&project)
        .map_err(|error| format!("failed to save project: {error}"))
}

#[tauri::command]
pub fn delete_project(
    project_id: String,
    data_service: State<'_, Mutex<DataService>>,
) -> Result<(), String> {
    let service = data_service
        .lock()
        .map_err(|error| format!("failed to lock data service: {error}"))?;

    service
        .delete_project(&project_id)
        .map_err(|error| format!("failed to delete project: {error}"))
}
