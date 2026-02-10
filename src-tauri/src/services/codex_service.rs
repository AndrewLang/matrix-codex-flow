use crate::models::chat::{ChatRequest, ChatResponse};
use crate::models::event_handler::CodexEventHandler;
use codex_sdk::{Codex, CodexOptions, ThreadEvent, ThreadOptions, TurnOptions};
use futures::StreamExt;

pub struct CodexService {
    codex: Codex,
}

impl CodexService {
    pub fn new() -> Self {
        Self {
            codex: Codex::new(CodexOptions::default())
                .expect("failed to initialize codex-sdk in CodexService::new"),
        }
    }

    pub async fn invoke_stream<H: CodexEventHandler>(
        &self,
        payload: ChatRequest,
        handler: H,
    ) -> Result<(), String> {
        let trimmed_prompt = payload.prompt.trim();

        if trimmed_prompt.is_empty() {
            return Err("prompt cannot be empty".to_string());
        }

        let thread_options = ThreadOptions {
            working_directory: payload.working_directory.clone(),
            ..ThreadOptions::default()
        };

        log::info!(
            "Starting thread with prompt: '{}' and working directory: '{}'",
            trimmed_prompt,
            thread_options.working_directory.as_deref().unwrap_or(".")
        );

        let thread = if let Some(id) = payload.thread_id {
            self.codex.resume_thread(id, thread_options)
        } else {
            self.codex.start_thread(thread_options)
        };

        let streamed = thread
            .run_streamed(trimmed_prompt.into(), TurnOptions::default())
            .map_err(|e| e.to_string())?;
        let mut events = streamed.events;

        while let Some(event) = events.next().await {
            match event.map_err(|e| e.to_string())? {
                ThreadEvent::TurnStarted { .. } => {
                    log::info!(" Turn started");
                }
                ThreadEvent::ItemUpdated { item } => {
                    log::info!("Received item update: {:?}", item);
                    let response = ChatResponse::from(item);
                    handler.on_item(response.to_json());
                }
                ThreadEvent::ItemCompleted { item } => {
                    log::info!("Received item: {:?}", item);
                    let response = ChatResponse::from(item);
                    handler.on_item(response.to_json());
                }
                ThreadEvent::TurnCompleted { usage } => {
                    log::info!("Turn completed with usage: {:?}", usage);
                    let response = ChatResponse::Done {
                        total_tokens: usage.output_tokens as u32,
                    };
                    handler.on_done(response.to_json());
                }
                ThreadEvent::TurnFailed { error } => {
                    log::error!("Turn failed: {:?}", error);
                    let response = ChatResponse::Error {
                        message: error.message.clone(),
                    };
                    handler.on_done(response.to_json());
                    return Err(error.message);
                }
                ThreadEvent::ThreadErrorEvent { message } => {
                    log::error!("Thread error: {}", message);
                    let response = ChatResponse::Error {
                        message: message.clone(),
                    };
                    handler.on_done(response.to_json());
                    return Err(message);
                }
                _ => {}
            }
        }

        Ok(())
    }
}
