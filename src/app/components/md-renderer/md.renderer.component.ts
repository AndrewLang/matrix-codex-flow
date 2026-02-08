import { Component, computed, inject, input, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import hljs from 'highlight.js';
import { marked, Renderer } from 'marked';

@Component({
    selector: 'mtx-md-renderer',
    templateUrl: 'md.renderer.component.html'
})
export class MarkdownRendererComponent {
    readonly markdown = input<string>('');

    private readonly sanitizer = inject(DomSanitizer);
    private readonly renderer = new Renderer();

    constructor() {
        this.renderer.code = ({ text, lang }) => {
            const valid = lang && hljs.getLanguage(lang);
            const highlighted = valid
                ? hljs.highlight(text, { language: lang }).value
                : hljs.highlightAuto(text).value;

            return `<pre><code class="hljs ${lang ?? ''}">${highlighted}</code></pre>`;
        };
    }

    readonly renderedHtml = computed(() => {
        const raw = marked.parse(this.markdown(), {
            gfm: true,
            breaks: true,
            renderer: this.renderer,
        });
        return this.sanitizer.sanitize(SecurityContext.HTML, raw) ?? '';
    });
}
