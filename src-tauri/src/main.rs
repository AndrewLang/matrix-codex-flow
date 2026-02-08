// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use vibeflow_lib::app::App;

fn main() {
    App::new()
        .run()
        .expect("error while running tauri application");
}
