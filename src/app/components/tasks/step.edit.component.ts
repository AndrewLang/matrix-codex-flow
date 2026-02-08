import { Component, input, output } from '@angular/core';
import { MarkdownEditorComponent } from '../md-editor/md.editor.component';

@Component({
    selector: 'mtx-step-editor',
    templateUrl: 'step.edit.component.html',
    imports: [MarkdownEditorComponent]
})
export class StepEditorComponent {
    readonly title = input<string>('');
    readonly content = input<string>('');

    readonly updateTitle = output<string>();
    readonly updateContent = output<string>();
    readonly cancel = output<void>();
    readonly save = output<void>();

    protected onUpdateTitle(value: string): void {
        this.updateTitle.emit(value);
    }

    protected onUpdateContent(value: string): void {
        this.updateContent.emit(value);
    }

    protected onCancel(): void {
        this.cancel.emit();
    }

    protected onSave(): void {
        this.save.emit();
    }
}
