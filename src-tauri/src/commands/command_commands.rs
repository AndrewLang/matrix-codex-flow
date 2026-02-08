use crate::services::command_service::CommandService;
use tauri::State;

#[tauri::command]
pub fn run_command(
    command: String,
    args: Vec<String>,
    stdin: Option<String>,
    cwd: Option<String>,
    command_service: State<'_, CommandService>,
) -> Result<String, String> {
    command_service.run_command(command, args, stdin, cwd)
}
