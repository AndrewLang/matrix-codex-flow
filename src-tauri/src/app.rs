use env_logger::Env;
use std::sync::Once;
use tauri::{Builder, Error, Wry};

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
            .setup(|app| {
                log::info!("backend logging initialized");
                log::info!("app name: {}", app.package_info().name);

                Ok(())
            })
    }

    fn initialize_logging() {
        static LOGGER_INIT: Once = Once::new();

        LOGGER_INIT.call_once(|| {
            env_logger::Builder::from_env(Env::default().default_filter_or("info")).init();
        });
    }
}
