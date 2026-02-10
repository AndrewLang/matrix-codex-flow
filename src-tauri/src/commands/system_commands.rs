use std::fs;
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

#[tauri::command]
pub fn write_text_file(path: String, content: String) -> Result<(), String> {
    let file_path = Path::new(&path);

    let parent = file_path
        .parent()
        .ok_or_else(|| format!("invalid file path: {path}"))?;

    fs::create_dir_all(parent)
        .map_err(|error| format!("failed to create directory '{}': {error}", parent.display()))?;

    fs::write(file_path, content)
        .map_err(|error| format!("failed to write file '{}': {error}", file_path.display()))
}

#[tauri::command]
pub fn path_exists(path: String) -> bool {
    Path::new(&path).exists()
}

#[tauri::command]
pub fn read_text_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|error| format!("failed to read file '{}': {error}", path))
}
