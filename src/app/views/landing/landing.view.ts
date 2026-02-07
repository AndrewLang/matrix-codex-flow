import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-view',
  standalone: true,
  template: `
    <section class="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <h1 class="text-2xl font-semibold text-white">Landing</h1>
      <p class="mt-2 text-sm text-slate-300">LandingView placeholder content.</p>
    </section>
  `,
})
export class LandingView {}
