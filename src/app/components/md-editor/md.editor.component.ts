import { AfterViewInit, Component, effect, ElementRef, input, OnDestroy, output, ViewChild } from '@angular/core';
import { defaultKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { Compartment, EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap, placeholder } from '@codemirror/view';


@Component({
    selector: 'mtx-md-editor',
    templateUrl: 'md.editor.component.html',
    host: {
        'class': 'block'
    }
})
export class MarkdownEditorComponent implements AfterViewInit, OnDestroy {
    readonly value = input<string>('');
    readonly placeholder = input<string>('Write markdown content');
    readonly background = input<string>('#0f172a');
    readonly enabled = input<boolean>(true);
    readonly fillHeight = input<boolean>(false);

    readonly valueChange = output<string>();
    readonly ctrlEnter = output<void>();
    readonly shiftEnter = output<void>();

    @ViewChild('editor', { static: true })
    private readonly editorRef!: ElementRef<HTMLDivElement>;

    private editorView: EditorView | null = null;
    private readonly editableCompartment = new Compartment();
    private readonly readOnlyCompartment = new Compartment();

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

        effect(() => {
            const isEnabled = this.enabled();
            const view = this.editorView;
            if (!view) {
                return;
            }

            view.dispatch({
                effects: [
                    this.readOnlyCompartment.reconfigure(EditorState.readOnly.of(!isEnabled)),
                    this.editableCompartment.reconfigure(EditorView.editable.of(isEnabled))
                ]
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
                    placeholder(this.placeholder()),
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
                    this.readOnlyCompartment.of(EditorState.readOnly.of(!this.enabled())),
                    this.editableCompartment.of(EditorView.editable.of(this.enabled())),
                    EditorView.theme({
                        '&': {
                            fontSize: '14px',
                        },
                        '.cm-editor': {
                            backgroundColor: this.background(),
                            height: this.fillHeight() ? '100%' : 'auto',
                        },
                        '.cm-scroller': {
                            backgroundColor: this.background(),
                            borderRadius: '0.25rem',
                            overflowY: this.fillHeight() ? 'auto' : 'hidden',
                            height: this.fillHeight() ? '100%' : 'auto',
                        },

                        '.cm-content': {
                            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                            minHeight: this.fillHeight() ? '100%' : '112px',
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
