use std::env;
use std::fs;
use std::path::PathBuf;

use tauri::{
    AppHandle, Manager, PhysicalPosition, PhysicalSize, Position, Runtime, Size, WebviewWindow,
    Window,
};

use crate::models::app_config::{AppConfig, MainWindowConfig};
use crate::models::setting::{SettingModel, SettingValue, SettingValueType};

const APP_FOLDER_NAME: &str = "vibeflow";
const APP_CONFIG_FILE_NAME: &str = "app.config.json";
const SETTINGS_FILE_NAME: &str = "settings.json";
const DEFAULT_WINDOW_WIDTH: u32 = 800;
const DEFAULT_WINDOW_HEIGHT: u32 = 1200;

pub struct AppService {
    app_data_dir: PathBuf,
    app_config_path: PathBuf,
    settings_path: PathBuf,
    app_config: AppConfig,
    settings: Vec<SettingModel>,
}

impl AppService {
    pub fn load<R: Runtime>(app_handle: &AppHandle<R>) -> Self {
        let app_data_dir = Self::resolve_app_data_dir(app_handle);
        if let Err(error) = fs::create_dir_all(&app_data_dir) {
            log::error!("failed to create app data dir {:?}: {}", app_data_dir, error);
        }

        let app_config_path = app_data_dir.join(APP_CONFIG_FILE_NAME);
        let settings_path = app_data_dir.join(SETTINGS_FILE_NAME);
        let app_config = Self::load_app_config(&app_config_path);
        let settings = Self::load_settings(&settings_path);

        let service = Self {
            app_data_dir,
            app_config_path,
            settings_path,
            app_config,
            settings,
        };

        if let Err(error) = service.save_app_config() {
            log::error!("failed to save app config: {}", error);
        }

        if let Err(error) = service.save_settings() {
            log::error!("failed to save settings: {}", error);
        }

        service
    }

    pub fn app_data_dir(&self) -> &PathBuf {
        &self.app_data_dir
    }

    pub fn get_settings(&self) -> Vec<SettingModel> {
        self.settings.clone()
    }

    pub fn set_settings(&mut self, settings: Vec<SettingModel>) -> Result<(), std::io::Error> {
        self.settings = settings;
        self.save_settings()
    }

    pub fn restore_main_window<R: Runtime>(&self, window: &WebviewWindow<R>) {
        let Some(main_window) = &self.app_config.main_window else {
            return;
        };

        let (width, height) = if main_window.width < DEFAULT_WINDOW_WIDTH || main_window.height < DEFAULT_WINDOW_HEIGHT {
            (DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT)
        } else {
            (main_window.width, main_window.height)
        };

        let _ = window.set_size(Size::Physical(PhysicalSize::new(width, height)));
        let _ = window.set_position(Position::Physical(PhysicalPosition::new(
            main_window.x,
            main_window.y,
        )));

        if main_window.maximized {
            let _ = window.maximize();
        }
    }

    pub fn capture_main_window_state<R: Runtime>(&mut self, window: &Window<R>) {
        let maximized = window.is_maximized().unwrap_or(false);

        if maximized {
            if let Some(main_window) = &mut self.app_config.main_window {
                main_window.maximized = true;
            }

            if let Err(error) = self.save_app_config() {
                log::error!("failed saving app config: {}", error);
            }
            return;
        }

        let position = match window.outer_position() {
            Ok(value) => value,
            Err(error) => {
                log::error!("failed reading window position: {}", error);
                return;
            }
        };

        let size = match window.inner_size() {
            Ok(value) => value,
            Err(error) => {
                log::error!("failed reading window size: {}", error);
                return;
            }
        };

        self.app_config.main_window = Some(MainWindowConfig {
            x: position.x,
            y: position.y,
            width: size.width,
            height: size.height,
            maximized: false,
        });

        if let Err(error) = self.save_app_config() {
            log::error!("failed saving app config: {}", error);
        }
    }

    fn load_app_config(path: &PathBuf) -> AppConfig {
        if !path.exists() {
            return AppConfig::default();
        }

        match fs::read_to_string(path) {
            Ok(content) => serde_json::from_str::<AppConfig>(&content).unwrap_or_default(),
            Err(_) => AppConfig::default(),
        }
    }

    fn load_settings(path: &PathBuf) -> Vec<SettingModel> {
        if !path.exists() {
            return Self::default_settings();
        }

        match fs::read_to_string(path) {
            Ok(content) => serde_json::from_str::<Vec<SettingModel>>(&content)
                .unwrap_or_else(|_| Self::default_settings()),
            Err(_) => Self::default_settings(),
        }
    }

    fn save_app_config(&self) -> Result<(), std::io::Error> {
        let content = serde_json::to_string_pretty(&self.app_config).unwrap_or_else(|_| "{}".to_string());
        fs::write(&self.app_config_path, content)
    }

    fn save_settings(&self) -> Result<(), std::io::Error> {
        let content = serde_json::to_string_pretty(&self.settings).unwrap_or_else(|_| "[]".to_string());
        fs::write(&self.settings_path, content)
    }

    fn default_settings() -> Vec<SettingModel> {
        vec![
            SettingModel {
                id: "setting-agent-provider".to_string(),
                key: "agent.provider".to_string(),
                value: SettingValue::String("codex".to_string()),
                value_type: SettingValueType::String,
            },
            SettingModel {
                id: "setting-prompt-template".to_string(),
                key: "prompt.template".to_string(),
                value: SettingValue::String(
                    "You are Codex working inside VibeFlow.\nFollow project context and rules, keep outputs concise, and produce actionable steps."
                        .to_string(),
                ),
                value_type: SettingValueType::String,
            },
            SettingModel {
                id: "setting-generate-folder".to_string(),
                key: "project.generateVibeflowFolder".to_string(),
                value: SettingValue::Boolean(true),
                value_type: SettingValueType::Boolean,
            },
        ]
    }

    fn resolve_app_data_dir<R: Runtime>(app_handle: &AppHandle<R>) -> PathBuf {
        #[cfg(target_os = "windows")]
        {
            if let Ok(local_app_data) = env::var("LOCALAPPDATA") {
                return PathBuf::from(local_app_data).join(APP_FOLDER_NAME);
            }
        }

        app_handle
            .path()
            .app_data_dir()
            .unwrap_or_else(|_| PathBuf::from("."))
            .join(APP_FOLDER_NAME)
    }
}
