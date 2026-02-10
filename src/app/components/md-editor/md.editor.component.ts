import { AfterViewInit, Component, effect, ElementRef, input, OnDestroy, output, ViewChild } from '@angular/core';
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
    readonly background = input<string>('#0f172a');
    readonly valueChange = output<string>();
    readonly ctrlEnter = output<void>();
    readonly shiftEnter = output<void>();

    @ViewChild('editor', { static: true })
    private readonly editorRef!: ElementRef<HTMLDivElement>;

    private editorView: EditorView | null = null;

    constructor() {
        effect(() => {
            const nextValue = this.value();
            const view = this.editorView;
            if (!view) {
                return;
            }

            const currentValue = view.state.doc.toString();
            if (currentValue === nextValue) {
                return;
            }

            view.dispatch({
                changes: {
                    from: 0,
                    to: view.state.doc.length,
                    insert: nextValue
                }
            });
        });
    }

    ngAfterViewInit(): void {
        this.editorView = new EditorView({
            parent: this.editorRef.nativeElement,
            state: EditorState.create({
                doc: this.value(),
                extensions: [
                    markdown(),
                    oneDark,
                    keymap.of([
                        {
                            key: 'Mod-Enter',
                            run: () => {
                                this.ctrlEnter.emit();
                                return true;
                            }
                        },
                        {
                            key: 'Shift-Enter',
                            run: () => {
                                this.shiftEnter.emit();
                                return false;
                            }
                        },
                        ...defaultKeymap
                    ]),
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
                            backgroundColor: this.background(),
                        },
                        '.cm-scroller': {
                            backgroundColor: this.background(),
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
