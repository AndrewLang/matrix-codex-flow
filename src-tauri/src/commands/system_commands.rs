use std::fs;
use std::path::Path;
use std::process::Command;
use tauri::Window;

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

    #[cfg(target_os = "macos")]    let mut command = {
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
pub fn open_url(url: String) -> Result<(), String> {
    let trimmed = url.trim();

    if trimmed.is_empty() {
        return Err("url cannot be empty".to_string());
    }

    #[cfg(target_os = "windows")]
    let mut command = {
        let mut cmd = Command::new("cmd");
        cmd.args(["/C", "start", "", trimmed]);
        cmd
    };

    #[cfg(target_os = "macos")]
    let mut command = {
        let mut cmd = Command::new("open");
        cmd.arg(trimmed);
        cmd
    };

    #[cfg(all(unix, not(target_os = "macos")))]
    let mut command = {
        let mut cmd = Command::new("xdg-open");
        cmd.arg(trimmed);
        cmd
    };

    command
        .spawn()
        .map(|_| ())
        .map_err(|error| format!("failed to open url: {error}"))
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
pub fn folder_has_git(path: String) -> Result<bool, String> {
    let folder_path = Path::new(&path);

    if !folder_path.exists() {
        return Err(format!("path does not exist: {path}"));
    }

    if !folder_path.is_dir() {
        return Err(format!("path is not a directory: {path}"));
    }

    let output = Command::new("git")
        .args(["rev-parse", "--is-inside-work-tree"])
        .current_dir(folder_path)
        .output();

    match output {
        Ok(out) => {
            if out.status.success() {
                let result = String::from_utf8_lossy(&out.stdout);
                Ok(result.trim() == "true")
            } else {
                Ok(false)
            }
        }
        Err(_) => Ok(false),
    }
}

#[tauri::command]
pub fn init_git_repository(path: String) -> Result<(), String> {
    let folder_path = Path::new(&path);

    if !folder_path.exists() {
        return Err(format!("path does not exist: {path}"));
    }

    if !folder_path.is_dir() {
        return Err(format!("path is not a directory: {path}"));
    }

    let output = Command::new("git")
        .arg("init")
        .current_dir(folder_path)
        .output()
        .map_err(|error| format!("failed to execute git init: {error}"))?;

    if output.status.success() {
        Ok(())
    } else {
        let error = String::from_utf8_lossy(&output.stderr).trim().to_string();
        if error.is_empty() {
            Err("failed to initialize git repository".to_string())
        } else {
            Err(error)
        }
    }
}

#[tauri::command]
pub fn is_git_installed() -> bool {
  log::info!("Checking if Git is installed...");
    Command::new("git")
        .arg("--version")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

#[tauri::command]
pub fn git_info() -> Result<String, String> {
  log::info!("Retrieving Git version information...");
    match Command::new("git").arg("--version").output() {
        Ok(out) if out.status.success() => {
            let raw = String::from_utf8_lossy(&out.stdout).trim().to_string();

            let version = raw.strip_prefix("git version ").unwrap_or(&raw).to_string();

            Ok(version)
        }
        _ => Err("git is not installed or not in PATH".into()),
    }
}

#[tauri::command]
pub fn is_codex_installed() -> bool {
  log::info!("Checking if Codex CLI is installed...");
    #[cfg(target_os = "windows")]
    let output = Command::new("cmd").args(["/C", "codex --version"]).output();

    #[cfg(not(target_os = "windows"))]
    let output = Command::new("codex").arg("--version").output();

    log::info!("Codex CLI check output: {:?}", output);
    output.map(|o| o.status.success()).unwrap_or(false)
}

#[tauri::command]
pub fn codex_version() -> Result<String, String> {
  log::info!("Retrieving Codex CLI version information...");
    #[cfg(target_os = "windows")]
    let output = Command::new("cmd").args(["/C", "codex --version"]).output();

    #[cfg(not(target_os = "windows"))]
    let output = Command::new("codex").arg("--version").output();

    log::info!("Codex CLI version check output: {:?}", output);
    match output {
        Ok(out) if out.status.success() => {
            Ok(String::from_utf8_lossy(&out.stdout).trim().to_string())
        }
        Ok(out) => {
            let err = String::from_utf8_lossy(&out.stderr).trim().to_string();
            if !err.is_empty() {
                Ok(err)
            } else {
                Err("Failed to read Codex version".into())
            }
        }
        Err(_) => Err("Codex CLI not found or not in PATH".into()),
    }
}

#[tauri::command]
pub fn read_text_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|error| format!("failed to read file '{}': {error}", path))
}

#[tauri::command]
pub fn toggle_main_window_always_on_top(window: Window) -> Result<bool, String> {
    let is_always_on_top = window
        .is_always_on_top()
        .map_err(|error| format!("failed to read always-on-top state: {error}"))?;
    let next_state = !is_always_on_top;

    window
        .set_always_on_top(next_state)
        .map_err(|error| format!("failed to set always-on-top state: {error}"))?;

    Ok(next_state)
}
