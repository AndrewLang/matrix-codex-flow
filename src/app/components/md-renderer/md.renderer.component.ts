import { Component, computed, inject, input, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import hljs from 'highlight.js';
import { marked, Renderer } from 'marked';

const EMPTY_MARKDOWN = '';

const renderer = new Renderer();

renderer.code = ({ text, lang }) => {
    const valid = lang && hljs.getLanguage(lang);
    const highlighted = valid
        ? hljs.highlight(text, { language: lang }).value
        : hljs.highlightAuto(text).value;

    return `<pre><code class="hljs ${lang ?? ''}">${highlighted}</code></pre>`;
};

marked.setOptions({
    gfm: true,
    breaks: true,
    renderer,
});

@Component({
    selector: 'mtx-md-renderer',
    templateUrl: 'md.renderer.component.html'
})
export class MarkdownRendererComponent implements OnInit {
    readonly markdown = input<string>(EMPTY_MARKDOWN);

    private readonly sanitizer = inject(DomSanitizer);

    ngOnInit(): void {

    }

    readonly renderedHtml = computed(() => {
        const raw = marked.parse(this.markdown());
        return this.sanitizer.sanitize(SecurityContext.HTML, raw) ?? '';
    });
}
