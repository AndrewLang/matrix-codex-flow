use crate::models::chat::ChatRequest;
use crate::models::event_handler::TauriCodexEventHandler;
use crate::services::codex_service::CodexService;
use tauri::State;

#[tauri::command]
pub async fn chat(
    payload: ChatRequest,
    app: tauri::AppHandle,
    codex_service: State<'_, CodexService>,
) -> Result<(), String> {
    let handler = TauriCodexEventHandler::new(app);
    codex_service.invoke_stream(payload, handler).await
}
