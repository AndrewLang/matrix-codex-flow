import { Component, input, output } from '@angular/core';
import { TaskStep } from '../../state/task-chain.store';

@Component({
  selector: 'app-task-step-card',
  standalone: true,
  templateUrl: './task.step.card.html',
})
export class TaskStepCardComponent {
  readonly step = input.required<TaskStep>();
  readonly stepIndex = input.required<number>();
  readonly totalSteps = input.required<number>();
  readonly gateDraft = input<string>('');

  readonly moveUp = output<void>();
  readonly moveDown = output<void>();
  readonly removeStep = output<void>();
  readonly updateTitle = output<string>();
  readonly updateTask = output<string>();
  readonly updateRequirements = output<string>();
  readonly updateEnabled = output<boolean>();
  readonly updateGateDraft = output<string>();
  readonly addGate = output<void>();
  readonly removeGate = output<string>();

  protected onTitleInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    this.updateTitle.emit(inputElement?.value ?? '');
  }

  protected onTaskInput(event: Event): void {
    const textareaElement = event.target as HTMLTextAreaElement | null;
    this.updateTask.emit(textareaElement?.value ?? '');
  }

  protected onRequirementsInput(event: Event): void {
    const textareaElement = event.target as HTMLTextAreaElement | null;
    this.updateRequirements.emit(textareaElement?.value ?? '');
  }

  protected onGateDraftInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    this.updateGateDraft.emit(inputElement?.value ?? '');
  }

  protected onGateDraftKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addGate.emit();
    }
  }

  protected onEnabledChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    this.updateEnabled.emit(inputElement?.checked ?? true);
  }

  protected badgeToneClasses(): string {
    const tone = this.stepIndex() % 4;
    if (tone === 0) {
      return 'bg-emerald-400/85 text-emerald-950 shadow-[0_0_24px_rgba(16,185,129,0.5)]';
    }
    if (tone === 1) {
      return 'bg-sky-400/85 text-sky-950 shadow-[0_0_24px_rgba(56,189,248,0.5)]';
    }
    if (tone === 2) {
      return 'bg-amber-300/90 text-amber-950 shadow-[0_0_24px_rgba(251,191,36,0.45)]';
    }
    return 'bg-fuchsia-300/90 text-fuchsia-950 shadow-[0_0_24px_rgba(232,121,249,0.45)]';
  }
}
