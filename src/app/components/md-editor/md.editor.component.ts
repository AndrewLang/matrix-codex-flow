import { AfterViewInit, Component, ElementRef, input, OnDestroy, output, ViewChild } from '@angular/core';
import { defaultKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap } from '@codemirror/view';


@Component({
    selector: 'mtx-md-editor',
    template: `
    <div #editor class="bg-transparent"></div>
  `
})
export class MarkdownEditorComponent implements AfterViewInit, OnDestroy {
    readonly value = input<string>('');
    readonly placeholder = input<string>('Write markdown content');
    readonly valueChange = output<string>();

    @ViewChild('editor', { static: true })
    private readonly editorRef!: ElementRef<HTMLDivElement>;

    private editorView: EditorView | null = null;

    ngAfterViewInit(): void {
        this.editorView = new EditorView({
            parent: this.editorRef.nativeElement,
            state: EditorState.create({
                doc: this.value(),
                extensions: [
                    markdown(),
                    oneDark,
                    keymap.of(defaultKeymap),
                    EditorView.lineWrapping,
                    EditorView.updateListener.of((update) => {
                        if (update.docChanged) {
                            const text = update.state.doc.toString();
                            this.valueChange.emit(text);
                        }
                    }),
                    EditorState.readOnly.of(false),
                    EditorView.theme({
                        '&': {
                            fontSize: '14px',
                        },
                        '.cm-editor': {
                            backgroundColor: '#0f172a',
                        },
                        '.cm-scroller': {
                            backgroundColor: '#0f172a',
                            borderRadius: '0.25rem',
                            overflow: 'hidden',
                        },

                        '.cm-content': {
                            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                            minHeight: '112px',
                            padding: '12px',
                            backgroundColor: 'transparent',
                        },

                        '.cm-gutters': {
                            border: 'none',
                            backgroundColor: 'transparent',
                        },

                        '.cm-placeholder': {
                            color: '#64748b',
                        },
                    })
                ]
            })
        });
    }

    ngOnDestroy(): void {
        this.editorView?.destroy();
    }
}
