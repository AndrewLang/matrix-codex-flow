pub mod chat_commands;
pub mod command_commands;
pub mod project_commands;
pub mod settings_commands;
pub mod system_commands;

#[macro_export]
macro_rules! known_commands {
    () => {
        tauri::generate_handler![
            crate::commands::command_commands::run_command,
            crate::commands::project_commands::load_recent_projects,
            crate::commands::project_commands::load_project,
            crate::commands::project_commands::save_project,
            crate::commands::project_commands::delete_project,
            crate::commands::project_commands::load_or_create_project_by_path,
            crate::commands::settings_commands::load_settings,
            crate::commands::settings_commands::save_settings,
            crate::commands::system_commands::open_folder,
            crate::commands::system_commands::open_url,
            crate::commands::system_commands::write_text_file,
            crate::commands::system_commands::path_exists,
            crate::commands::system_commands::folder_has_git,
            crate::commands::system_commands::init_git_repository,
            crate::commands::system_commands::read_text_file,
            crate::commands::system_commands::toggle_main_window_always_on_top,
            crate::commands::system_commands::is_git_installed,
            crate::commands::system_commands::git_info,
            crate::commands::system_commands::is_codex_installed,
            crate::commands::system_commands::codex_version,
            crate::commands::chat_commands::chat,
            crate::commands::chat_commands::save_chat_thread,
            crate::commands::chat_commands::save_chat_message,
            crate::commands::chat_commands::load_chat_threads,
            crate::commands::chat_commands::load_chat_messages,
        ]
    };
}
