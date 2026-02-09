import { Component, effect, input, output, signal } from '@angular/core';
import { StepViewModel } from '../../models/task';
import { MarkdownEditorComponent } from '../md-editor/md.editor.component';

@Component({
    selector: 'mtx-step-editor',
    templateUrl: 'step.edit.component.html',
    imports: [MarkdownEditorComponent]
})
export class StepEditorComponent {
    readonly step = input.required<StepViewModel>();
    readonly title = signal<string>('');
    readonly content = signal<string>('');

    readonly cancel = output<StepViewModel>();
    readonly save = output<StepViewModel>();

    constructor() {
        effect(() => {
            const step = this.step();
            this.title.set(step.title);
            this.content.set(step.content);
        });
    }

    protected onCancel(): void {
        this.cancel.emit(this.step());
    }

    protected onSave(): void {
        this.step().title = this.title();
        this.step().content = this.content();

        const updatedStep: StepViewModel = {
            ...this.step(),
            title: this.title(),
            content: this.content()
        };

        this.save.emit(updatedStep);
    }
}
