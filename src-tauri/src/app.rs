use tauri::{Builder, Error, Wry};

pub struct App;

impl App {
    pub fn new() -> Self {
        Self
    }

    pub fn run(self) -> Result<(), Error> {
        self.build()
            .run(tauri::generate_context!())
            .map_err(Into::into)
    }

    fn build(&self) -> Builder<Wry> {
        Builder::default()
            .plugin(tauri_plugin_dialog::init())
            .setup(|app| {
                if cfg!(debug_assertions) {
                    app.handle().plugin(
                        tauri_plugin_log::Builder::default()
                            .level(log::LevelFilter::Info)
                            .build(),
                    )?;
                }

                Ok(())
            })
    }
}
