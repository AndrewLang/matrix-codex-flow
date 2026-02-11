use env_logger::Env;
use std::sync::{Mutex, Once};
use tauri::{Builder, Error, Manager, WindowEvent, Wry};

use crate::services::app_service::AppService;
use crate::services::codex_service::CodexService;
use crate::services::command_service::CommandService;
use crate::services::data_service::DataService;

pub struct App;

impl App {
    pub fn new() -> Self {
        Self
    }

    pub fn run(self) -> Result<(), Error> {
        Self::initialize_logging();
        self.build()
            .run(tauri::generate_context!())
            .map_err(Into::into)
    }

    fn build(&self) -> Builder<Wry> {
        Builder::default()
            .plugin(tauri_plugin_dialog::init())
            .invoke_handler(tauri::generate_handler![
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
            ])
            .on_window_event(|window, event| {
                if window.label() != "main" {
                    return;
                }

                match event {
                    WindowEvent::Moved(_)
                    | WindowEvent::Resized(_)
                    | WindowEvent::CloseRequested { .. } => {
                        let state = window.app_handle().state::<Mutex<AppService>>();
                        let lock_result = state.lock();
                        if let Ok(mut app_service) = lock_result {
                            app_service.capture_main_window_state(window);
                        }
                    }
                    _ => {}
                }
            })
            .setup(|app| {
                let app_service = AppService::load(app.handle());
                log::info!(
                    "app data directory: {}",
                    app_service.app_data_dir().display()
                );
                let data_service = match DataService::new(app_service.app_data_dir().clone()) {
                    Ok(service) => service,
                    Err(error) => return Err(error.into()),
                };

                if let Some(main_window) = app.get_webview_window("main") {
                    app_service.restore_main_window(&main_window);
                    let _ = main_window.show();
                }

                app.manage(Mutex::new(app_service));
                app.manage(Mutex::new(data_service));
                app.manage(CodexService::new());
                app.manage(CommandService::new());
                log::info!("backend logging initialized");
                log::info!("app name: {}", app.package_info().name);

                Ok(())
            })
    }

    fn initialize_logging() {
        static LOGGER_INIT: Once = Once::new();

        LOGGER_INIT.call_once(|| {
            env_logger::Builder::from_env(Env::default().default_filter_or("debug")).init();
        });
    }
}
