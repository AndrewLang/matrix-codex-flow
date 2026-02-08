use std::path::Path;
use std::process::Command;

#[tauri::command]
pub fn open_folder(path: String) -> Result<(), String> {
    let folder_path = Path::new(&path);

    if !folder_path.exists() {
        return Err(format!("path does not exist: {path}"));
    }

    if !folder_path.is_dir() {
        return Err(format!("path is not a directory: {path}"));
    }

    #[cfg(target_os = "windows")]
    let mut command = {
        let mut cmd = Command::new("explorer");
        cmd.arg(&path);
        cmd
    };

    #[cfg(target_os = "macos")]
    let mut command = {
        let mut cmd = Command::new("open");
        cmd.arg(&path);
        cmd
    };

    #[cfg(all(unix, not(target_os = "macos")))]
    let mut command = {
        let mut cmd = Command::new("xdg-open");
        cmd.arg(&path);
        cmd
    };

    command
        .spawn()
        .map(|_| ())
        .map_err(|error| format!("failed to open folder: {error}"))
}
