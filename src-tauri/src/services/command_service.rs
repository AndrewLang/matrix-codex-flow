use std::io::Write;
use std::process::{Command, Stdio};

pub struct CommandService;

impl CommandService {
    pub fn new() -> Self {
        Self
    }

    pub fn run_command(
        &self,
        command: String,
        args: Vec<String>,
        stdin: Option<String>,
        cwd: Option<String>,
    ) -> Result<String, String> {
        let trimmed_command = command.trim();
        if trimmed_command.is_empty() {
            return Err("command name cannot be empty".to_string());
        }

        let working_dir = cwd.unwrap_or_else(|| ".".to_string());

        log::info!(
            "Running command: {trimmed_command} with args: {:?} in directory: {working_dir}",
            args
        );
        log::info!("Stdin: {:?}", stdin);

        let mut child = Command::new(trimmed_command)
            .args(args)
            .current_dir(working_dir)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|error| format!("Failed to spawn process: {error}"))?;

        if let Some(input) = stdin {
            let stdin_pipe = child.stdin.as_mut().ok_or("Failed to open stdin")?;
            stdin_pipe
                .write_all(input.as_bytes())
                .map_err(|error| format!("Failed to write stdin: {error}"))?;
        }

        let output = child
            .wait_with_output()
            .map_err(|error| format!("Failed to read output: {error}"))?;

        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }

        log::info!(
            "Command output: {}",
            String::from_utf8_lossy(&output.stdout)
        );

        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }
}
