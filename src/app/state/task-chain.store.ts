import { Injectable, computed, signal } from '@angular/core';

export type TaskStep = {
  id: string;
  title: string;
  task: string;
  requirements: string;
  gates: string[];
  enabled: boolean;
};

export type TaskChain = {
  id: string;
  name: string;
  steps: TaskStep[];
};

export const TASK_CHAIN_STORAGE_KEY_PREFIX = 'codexflow:task-chain:';
const TASK_CHAIN_INDEX_KEY = `${TASK_CHAIN_STORAGE_KEY_PREFIX}index`;

@Injectable({
  providedIn: 'root',
})
export class TaskChainStore {
  readonly chains = signal<TaskChain[]>([]);
  readonly selectedChainId = signal<string | null>(null);
  readonly selectedChain = computed<TaskChain | null>(() => {
    const selectedId = this.selectedChainId();
    if (!selectedId) {
      return null;
    }
    return this.chains().find((chain) => chain.id === selectedId) ?? null;
  });

  constructor() {
    this.load();
  }

  createChain(): void {
    const chainId = this.generateId();
    const chain: TaskChain = {
      id: chainId,
      name: 'New Chain',
      steps: [this.createEmptyStep()],
    };
    this.upsertChain(chain);
    this.selectedChainId.set(chain.id);
  }

  selectChain(chainId: string): void {
    const exists = this.chains().some((chain) => chain.id === chainId);
    if (!exists) {
      return;
    }
    this.selectedChainId.set(chainId);
  }

  renameChain(chainId: string, name: string): void {
    const normalizedName = name.trim();
    this.updateChain(chainId, (chain) => ({
      ...chain,
      name: normalizedName.length > 0 ? normalizedName : 'Untitled Chain',
    }));
  }

  updateSelectedChainName(name: string): void {
    const selectedId = this.selectedChainId();
    if (!selectedId) {
      return;
    }
    this.renameChain(selectedId, name);
  }

  deleteChain(chainId: string): void {
    const nextChains = this.chains().filter((chain) => chain.id !== chainId);
    this.chains.set(nextChains);
    this.deleteChainStorage(chainId);
    this.writeIndex(nextChains.map((chain) => chain.id));

    const selectedId = this.selectedChainId();
    if (selectedId === chainId) {
      this.selectedChainId.set(nextChains[0]?.id ?? null);
    }
  }

  addStepToSelectedChain(): void {
    const selectedId = this.selectedChainId();
    if (!selectedId) {
      return;
    }
    this.updateChain(selectedId, (chain) => ({
      ...chain,
      steps: [...chain.steps, this.createEmptyStep()],
    }));
  }

  removeStepFromSelectedChain(stepId: string): void {
    const selectedId = this.selectedChainId();
    if (!selectedId) {
      return;
    }
    this.updateChain(selectedId, (chain) => ({
      ...chain,
      steps: chain.steps.filter((step) => step.id !== stepId),
    }));
  }

  moveStepInSelectedChain(stepId: string, direction: 'up' | 'down'): void {
    const selectedId = this.selectedChainId();
    if (!selectedId) {
      return;
    }
    this.updateChain(selectedId, (chain) => {
      const index = chain.steps.findIndex((step) => step.id === stepId);
      if (index < 0) {
        return chain;
      }
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= chain.steps.length) {
        return chain;
      }
      const nextSteps = [...chain.steps];
      const current = nextSteps[index];
      nextSteps[index] = nextSteps[targetIndex];
      nextSteps[targetIndex] = current;
      return {
        ...chain,
        steps: nextSteps,
      };
    });
  }

  updateStepInSelectedChain(
    stepId: string,
    partial: Partial<Pick<TaskStep, 'title' | 'task' | 'requirements' | 'gates' | 'enabled'>>
  ): void {
    const selectedId = this.selectedChainId();
    if (!selectedId) {
      return;
    }
    this.updateChain(selectedId, (chain) => ({
      ...chain,
      steps: chain.steps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              ...partial,
            }
          : step
      ),
    }));
  }

  addGateToStepInSelectedChain(stepId: string, gate: string): void {
    const normalizedGate = gate.trim();
    if (!normalizedGate) {
      return;
    }
    const selected = this.selectedChain();
    if (!selected) {
      return;
    }
    const step = selected.steps.find((item) => item.id === stepId);
    if (!step || step.gates.includes(normalizedGate)) {
      return;
    }
    this.updateStepInSelectedChain(stepId, {
      gates: [...step.gates, normalizedGate],
    });
  }

  removeGateFromStepInSelectedChain(stepId: string, gate: string): void {
    const selected = this.selectedChain();
    if (!selected) {
      return;
    }
    const step = selected.steps.find((item) => item.id === stepId);
    if (!step) {
      return;
    }
    this.updateStepInSelectedChain(stepId, {
      gates: step.gates.filter((item) => item !== gate),
    });
  }

  private load(): void {
    const ids = this.readIndex();
    const loadedChains = ids
      .map((id) => this.readChain(id))
      .filter((chain): chain is TaskChain => chain !== null);
    this.chains.set(loadedChains);
    this.selectedChainId.set(loadedChains[0]?.id ?? null);
  }

  private upsertChain(chain: TaskChain): void {
    const existing = this.chains();
    const index = existing.findIndex((item) => item.id === chain.id);
    const next =
      index >= 0
        ? existing.map((item) => (item.id === chain.id ? chain : item))
        : [...existing, chain];
    this.chains.set(next);
    this.writeIndex(next.map((item) => item.id));
    this.writeChain(chain);
  }

  private updateChain(chainId: string, updater: (chain: TaskChain) => TaskChain): void {
    const chain = this.chains().find((item) => item.id === chainId);
    if (!chain) {
      return;
    }
    const nextChain = updater(chain);
    this.upsertChain(nextChain);
  }

  private createEmptyStep(): TaskStep {
    return {
      id: this.generateId(),
      title: '',
      task: '',
      requirements: '',
      gates: [],
      enabled: true,
    };
  }

  private storageKeyForChain(chainId: string): string {
    return `${TASK_CHAIN_STORAGE_KEY_PREFIX}${chainId}`;
  }

  private writeIndex(ids: string[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(TASK_CHAIN_INDEX_KEY, JSON.stringify(ids));
  }

  private readIndex(): string[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    const raw = localStorage.getItem(TASK_CHAIN_INDEX_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter((item): item is string => typeof item === 'string');
    } catch {
      return [];
    }
  }

  private writeChain(chain: TaskChain): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(this.storageKeyForChain(chain.id), JSON.stringify(chain));
  }

  private readChain(chainId: string): TaskChain | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const raw = localStorage.getItem(this.storageKeyForChain(chainId));
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      return this.sanitizeChain(parsed);
    } catch {
      return null;
    }
  }

  private deleteChainStorage(chainId: string): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.removeItem(this.storageKeyForChain(chainId));
  }

  private sanitizeChain(value: unknown): TaskChain | null {
    if (!value || typeof value !== 'object') {
      return null;
    }
    const raw = value as Partial<TaskChain>;
    if (typeof raw.id !== 'string' || typeof raw.name !== 'string' || !Array.isArray(raw.steps)) {
      return null;
    }
    const steps = raw.steps
      .map((step) => this.sanitizeStep(step))
      .filter((step): step is TaskStep => step !== null);
    return {
      id: raw.id,
      name: raw.name.trim() || 'Untitled Chain',
      steps,
    };
  }

  private sanitizeStep(value: unknown): TaskStep | null {
    if (!value || typeof value !== 'object') {
      return null;
    }
    const raw = value as Partial<TaskStep>;
    if (
      typeof raw.id !== 'string' ||
      typeof raw.title !== 'string' ||
      typeof raw.task !== 'string' ||
      typeof raw.requirements !== 'string' ||
      !Array.isArray(raw.gates)
    ) {
      return null;
    }
    const gates = raw.gates.filter((gate): gate is string => typeof gate === 'string');
    const enabled = typeof raw.enabled === 'boolean' ? raw.enabled : true;
    return {
      id: raw.id,
      title: raw.title,
      task: raw.task,
      requirements: raw.requirements,
      gates,
      enabled,
    };
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    const pattern = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return pattern.replace(/[xy]/g, (char) => {
      const random = Math.floor(Math.random() * 16);
      const value = char === 'x' ? random : (random & 0x3) | 0x8;
      return value.toString(16);
    });
  }
}
