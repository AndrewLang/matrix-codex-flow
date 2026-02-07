import { Component, computed, input } from '@angular/core';

export type UiPanelPadding = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-panel',
  standalone: true,
  templateUrl: './ui.panel.html',
})
export class UiPanel {
  readonly padding = input<UiPanelPadding>('md');
  readonly className = input<string>('');

  protected readonly panelClasses = computed(() => {
    const baseClasses =
      'rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xl shadow-slate-950/35 backdrop-blur';
    const paddingClasses =
      this.padding() === 'sm' ? 'p-4' : this.padding() === 'lg' ? 'p-8' : 'p-6';
    return `${baseClasses} ${paddingClasses}${this.className() ? ` ${this.className()}` : ''}`;
  });
}
