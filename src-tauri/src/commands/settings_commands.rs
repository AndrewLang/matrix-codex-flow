use std::sync::Mutex;

use tauri::State;

use crate::models::setting::SettingModel;
use crate::services::app_service::AppService;

#[tauri::command]
pub fn load_settings(
    app_service: State<'_, Mutex<AppService>>,
) -> Result<Vec<SettingModel>, String> {
    let service = app_service
        .lock()
        .map_err(|error| format!("failed to lock app service: {error}"))?;

    Ok(service.get_settings())
}

#[tauri::command]
pub fn save_settings(
    settings: Vec<SettingModel>,
    app_service: State<'_, Mutex<AppService>>,
) -> Result<(), String> {
    let mut service = app_service
        .lock()
        .map_err(|error| format!("failed to lock app service: {error}"))?;

    service
        .set_settings(settings)
        .map_err(|error| format!("failed to save settings: {error}"))
}
