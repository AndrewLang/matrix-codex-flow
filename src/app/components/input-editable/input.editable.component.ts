import { CommonModule } from '@angular/common';
import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'mtx-input-editable',
    templateUrl: 'input.editable.component.html',
    imports: [CommonModule, IconComponent]
})
export class InputEditableComponent {
    readonly value = input<string>('');
    readonly multiline = input<boolean>(false);
    readonly placeholder = input<string>('');
    readonly textClass = input<string>('text-sm text-slate-200');
    readonly editorClass = input<string>(
        'w-full rounded bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 border border-amber-600'
    );
    readonly icon = input<string>('pencil text-xs');
    readonly editIconButtonClass = input<string>('rounded-full px-2 py-1 text-sky-300 transition hover:bg-slate-700');

    readonly submitValue = output<string>();

    protected readonly isEditing = signal(false);
    protected readonly draft = signal('');

    private readonly textInputRef = viewChild<ElementRef<HTMLInputElement>>('textInputRef');
    private readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textareaRef');

    protected startEdit(): void {
        this.draft.set(this.value());
        this.isEditing.set(true);

        this.focusEditorAfterRender();
    }

    protected onDraftInput(value: string): void {
        this.draft.set(value);
    }

    protected onEditorBlur(): void {
        this.isEditing.set(false);
        this.submitValue.emit(this.draft());
    }

    protected onInputKeydown(event: KeyboardEvent): void {
        if (event.key !== 'Enter') {
            return;
        }

        event.preventDefault();
        this.onEditorBlur();
    }

    private focusEditorAfterRender(): void {
        setTimeout(() => {
            const element = this.multiline()
                ? this.textareaRef()?.nativeElement
                : this.textInputRef()?.nativeElement;

            if (!element) {
                return;
            }

            element.focus({ preventScroll: true });

            const length = element.value.length;
            element.setSelectionRange(length, length);
        }, 0);
    }
}
