use tauri::Emitter;

pub trait CodexEventHandler: Send + Sync {
    fn on_item(&self, item: serde_json::Value);
    fn on_done(&self, usage: serde_json::Value);
}

pub struct TauriCodexEventHandler {
    app: tauri::AppHandle,
}

impl TauriCodexEventHandler {
    pub fn new(app: tauri::AppHandle) -> Self {
        Self { app }
    }
}

impl CodexEventHandler for TauriCodexEventHandler {
    fn on_item(&self, item: serde_json::Value) {
        let _ = self.app.emit("codex:message", item);
    }

    fn on_done(&self, usage: serde_json::Value) {
        let _ = self.app.emit("codex:done", usage);
    }
}
