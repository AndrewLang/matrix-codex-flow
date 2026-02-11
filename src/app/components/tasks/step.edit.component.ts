import { Component, effect, input, output, signal } from '@angular/core';
import { timer } from 'rxjs';
import { StepViewModel } from '../../models/task';
import { IconComponent } from "../icon/icon.component";
import { MarkdownEditorComponent } from '../md-editor/md.editor.component';

@Component({
    selector: 'mtx-step-editor',
    templateUrl: 'step.edit.component.html',
    imports: [MarkdownEditorComponent, IconComponent]
})
export class StepEditorComponent {
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
        timer(5000).subscribe(() => {
            // this.chatService.sendMessage(this.step().content);
            this.isGenerating.set(false);
        });
    }
}
