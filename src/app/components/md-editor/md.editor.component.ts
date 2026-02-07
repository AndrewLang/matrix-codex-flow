import { Component, computed, effect, inject, input, output, SecurityContext, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';

import { MarkdownTool } from '../../models/markdown.tool';
import { IconComponent } from '../icon/icon.component';

const MARKDOWN_TOOLS: MarkdownTool[] = [
    { icon: 'type-bold', label: 'Bold', snippet: '**bold text**' },
    { icon: 'type-italic', label: 'Italic', snippet: '*italic text*' },
    { icon: 'code-square', label: 'Code', snippet: '`inline code`' },
    { icon: 'list-ul', label: 'List', snippet: '- list item' },
    { icon: 'link-45deg', label: 'Link', snippet: '[title](https://example.com)' }
];

const EMPTY_CONTENT = '';
const LINE_BREAK = '\n';

@Component({
    selector: 'mtx-md-editor',
    templateUrl: 'md.editor.component.html',
    imports: [IconComponent]
})
export class MarkdownEditorComponent {
    readonly content = input<string>(EMPTY_CONTENT);
    readonly placeholder = input<string>('Write markdown content');
    readonly contentChange = output<string>();
    readonly showToolbar = input<boolean>(false);

    protected readonly markdownTools = MARKDOWN_TOOLS;
    protected readonly isPreviewMode = signal(false);
    protected readonly contentState = signal(EMPTY_CONTENT);
    protected readonly previewHtml = computed(() => this.renderMarkdown(this.contentState()));

    private readonly sanitizer = inject(DomSanitizer);

    constructor() {
        effect(() => {
            this.contentState.set(this.content());
        });
    }

    protected togglePreviewMode(): void {
        this.isPreviewMode.update((value) => !value);
    }

    protected updateContent(nextContent: string): void {
        this.contentState.set(nextContent);
        this.contentChange.emit(nextContent);
    }

    protected insertSnippet(snippet: string): void {
        const currentContent = this.contentState();
        const hasContent = currentContent.length > 0;
        const needsNewLine = hasContent && !currentContent.endsWith(LINE_BREAK);
        const nextContent = `${currentContent}${needsNewLine ? LINE_BREAK : EMPTY_CONTENT}${snippet}`;
        this.updateContent(nextContent);
    }

    private renderMarkdown(content: string): string {
        const rawHtml = marked.parse(content, { async: false, breaks: true, gfm: true });
        return this.sanitizer.sanitize(SecurityContext.HTML, rawHtml) ?? EMPTY_CONTENT;
    }
}
