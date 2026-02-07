import { Component, inject, signal } from '@angular/core';
import { TaskChainStore } from '../../state/task-chain.store';
import { TaskStepCardComponent } from './task.step.card';

@Component({
  selector: 'app-task-chain-editor-view',
  standalone: true,
  imports: [TaskStepCardComponent],
  templateUrl: './task-chain-editor.view.html',
})
export class TaskChainEditorView {
  protected readonly taskChainStore = inject(TaskChainStore);
  protected readonly chains = this.taskChainStore.chains;
  protected readonly selectedChainId = this.taskChainStore.selectedChainId;
  protected readonly selectedChain = this.taskChainStore.selectedChain;
  protected readonly stepGateDrafts = signal<Record<string, string>>({});

  protected createChain(): void {
    this.taskChainStore.createChain();
  }

  protected selectChain(chainId: string): void {
    this.taskChainStore.selectChain(chainId);
  }

  protected renameChain(chainId: string, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.taskChainStore.renameChain(chainId, input?.value ?? '');
  }

  protected renameSelectedChain(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.taskChainStore.updateSelectedChainName(input?.value ?? '');
  }

  protected deleteChain(chainId: string): void {
    this.taskChainStore.deleteChain(chainId);
  }

  protected addStep(): void {
    this.taskChainStore.addStepToSelectedChain();
  }

  protected removeStep(stepId: string): void {
    this.taskChainStore.removeStepFromSelectedChain(stepId);
    this.clearStepGateDraft(stepId);
  }

  protected moveStepUp(stepId: string): void {
    this.taskChainStore.moveStepInSelectedChain(stepId, 'up');
  }

  protected moveStepDown(stepId: string): void {
    this.taskChainStore.moveStepInSelectedChain(stepId, 'down');
  }

  protected updateStepTitle(stepId: string, value: string): void {
    this.taskChainStore.updateStepInSelectedChain(stepId, {
      title: value,
    });
  }

  protected updateStepTask(stepId: string, value: string): void {
    this.taskChainStore.updateStepInSelectedChain(stepId, {
      task: value,
    });
  }

  protected updateStepRequirements(stepId: string, value: string): void {
    this.taskChainStore.updateStepInSelectedChain(stepId, {
      requirements: value,
    });
  }

  protected updateStepGateDraft(stepId: string, value: string): void {
    this.stepGateDrafts.update((drafts) => ({
      ...drafts,
      [stepId]: value,
    }));
  }

  protected addStepGate(stepId: string): void {
    const draft = this.stepGateDrafts()[stepId] ?? '';
    this.taskChainStore.addGateToStepInSelectedChain(stepId, draft);
    this.stepGateDrafts.update((drafts) => ({
      ...drafts,
      [stepId]: '',
    }));
  }

  protected removeStepGate(stepId: string, gate: string): void {
    this.taskChainStore.removeGateFromStepInSelectedChain(stepId, gate);
  }

  protected updateStepEnabled(stepId: string, enabled: boolean): void {
    this.taskChainStore.updateStepInSelectedChain(stepId, { enabled });
  }

  protected gateDraftValue(stepId: string): string {
    return this.stepGateDrafts()[stepId] ?? '';
  }

  protected runSelectedChain(): void {
    this.selectedChain();
  }

  private clearStepGateDraft(stepId: string): void {
    this.stepGateDrafts.update((drafts) => {
      const nextDrafts: Record<string, string> = {};
      for (const key of Object.keys(drafts)) {
        if (key !== stepId) {
          nextDrafts[key] = drafts[key];
        }
      }
      return nextDrafts;
    });
  }
}
