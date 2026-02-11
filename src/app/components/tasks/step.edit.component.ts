import { Component, effect, inject, input, output, signal } from '@angular/core';
import { StepViewModel } from '../../models/task';
import { ChatService } from '../../services/chat.service';
import { IconComponent } from "../icon/icon.component";
import { MarkdownEditorComponent } from '../md-editor/md.editor.component';

@Component({
    selector: 'mtx-step-editor',
    templateUrl: 'step.edit.component.html',
    imports: [MarkdownEditorComponent, IconComponent]
})
export class StepEditorComponent {
    private readonly chatService = inject(ChatService);

    readonly step = input.required<StepViewModel>();
    readonly title = signal<string>('');
    readonly content = signal<string>('');
    readonly isGenerating = signal(false);

    readonly cancel = output<StepViewModel>();
    readonly save = output<StepViewModel>();

    constructor() {
        effect(() => {
            const step = this.step();
            this.title.set(step.title);
            this.content.set(step.content);
        });
    }

    onCancel(): void {
        this.cancel.emit(this.step());
    }

    onSave(): void {
        this.step().title = this.title();
        this.step().content = this.content();

        const updatedStep: StepViewModel = {
            ...this.step(),
            title: this.title(),
            content: this.content()
        };

        this.save.emit(updatedStep);
    }

    async optimizePrompt(): Promise<void> {
        this.isGenerating.set(true);
        let optimizedContent = await this.chatService.optimizePrompt(this.step().content);
        this.content.set(optimizedContent);
        this.isGenerating.set(false);
    }
}
