import { Injectable, signal } from '@angular/core';

export type StepRunStatus = 'pending' | 'running' | 'succeeded' | 'failed';

export type StepRunItem = {
  id: string;
  title: string;
  status: StepRunStatus;
};

const MOCK_STEP_RUNS: StepRunItem[] = [
  { id: 'step-1', title: 'Analyze project context', status: 'succeeded' },
  { id: 'step-2', title: 'Generate implementation plan', status: 'running' },
  { id: 'step-3', title: 'Apply code changes', status: 'pending' },
  { id: 'step-4', title: 'Run validations', status: 'pending' },
];

@Injectable({
  providedIn: 'root',
})
export class StepRunStore {
  readonly steps = signal<StepRunItem[]>(MOCK_STEP_RUNS);
}
