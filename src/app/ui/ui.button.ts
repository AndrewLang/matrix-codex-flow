import { Component, computed, input } from '@angular/core';

export type UiButtonVariant = 'primary' | 'ghost' | 'danger';
export type UiButtonSize = 'sm' | 'md';
export type UiButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'ui-button',
  standalone: true,
  templateUrl: './ui.button.html',
})
export class UiButton {
  readonly variant = input<UiButtonVariant>('ghost');
  readonly size = input<UiButtonSize>('md');
  readonly type = input<UiButtonType>('button');
  readonly disabled = input<boolean>(false);
  readonly className = input<string>('');

  protected readonly buttonClasses = computed(() => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40 disabled:cursor-not-allowed disabled:opacity-50';
    const sizeClasses =
      this.size() === 'sm' ? 'px-3 py-1.5 text-xs sm:text-sm' : 'px-4 py-2 text-sm sm:text-base';

    if (this.variant() === 'primary') {
      return `${baseClasses} ${sizeClasses} bg-emerald-500 text-slate-950 hover:bg-emerald-400`;
    }

    if (this.variant() === 'danger') {
      return `${baseClasses} ${sizeClasses} border border-red-400/40 bg-red-500/10 text-red-200 hover:border-red-300 hover:bg-red-500/20`;
    }

    return `${baseClasses} ${sizeClasses} border border-slate-700 bg-slate-900/70 text-slate-100 hover:border-slate-500 hover:bg-slate-800`;
  });
}
