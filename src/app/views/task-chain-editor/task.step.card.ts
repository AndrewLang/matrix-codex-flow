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
}
