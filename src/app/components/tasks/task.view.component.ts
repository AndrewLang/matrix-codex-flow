import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { TaskStep } from '../../models/task';
import { TaskService } from '../../services/task.service';
import { IconComponent } from '../icon/icon.component';
import { MarkdownRendererComponent } from '../md-renderer/md.renderer.component';

type TimelineStepKind = 'pre' | 'main' | 'post';

interface TaskTimelineItem {
    id: string;
    mainStepIndex: number;
    kind: TimelineStepKind;
    step: TaskStep;
}

@Component({
    selector: 'mtx-task-view',
    templateUrl: 'task.view.component.html',
    imports: [CommonModule, IconComponent, MarkdownRendererComponent]
})
export class TaskViewComponent {
    private readonly taskService = inject(TaskService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    protected readonly collapsedTimelineItemIds = signal<Record<string, boolean>>({});

    private readonly taskId = toSignal(
        this.route.paramMap.pipe(map((params) => params.get('taskId') ?? '')),
        { initialValue: '' }
    );

    protected readonly task = computed(() => this.taskService.findTask(this.taskId()));
    protected readonly timeline = computed(() => {
        const selectedTask = this.task();
        if (!selectedTask) {
            return [] as TaskTimelineItem[];
        }

        const timelineItems: TaskTimelineItem[] = [];
        selectedTask.steps.forEach((mainStep, mainStepIndex) => {
            selectedTask.presteps.forEach((step) => {
                timelineItems.push({
                    id: `${mainStep.id}-pre-${step.id}`,
                    mainStepIndex,
                    kind: 'pre',
                    step,
                });
            });

            timelineItems.push({
                id: `${mainStep.id}-main`,
                mainStepIndex,
                kind: 'main',
                step: mainStep,
            });

            selectedTask.poststeps.forEach((step) => {
                timelineItems.push({
                    id: `${mainStep.id}-post-${step.id}`,
                    mainStepIndex,
                    kind: 'post',
                    step,
                });
            });
        });

        return timelineItems;
    });

    protected goBack(): void {
        void this.router.navigate(['/workspace/tasks']);
    }

    protected runTask(): void {
        const selectedTask = this.task();
        if (!selectedTask) {
            return;
        }

        this.taskService.runTask(selectedTask.id);
    }

    protected timelineTitle(item: TaskTimelineItem): string {
        const phase = item.kind === 'pre' ? 'Pre Step' : item.kind === 'post' ? 'Post Step' : 'Main Step';
        return `${phase} - Cycle ${item.mainStepIndex + 1}`;
    }

    protected timelineIcon(item: TaskTimelineItem): string {
        if (item.kind === 'pre') {
            return 'arrow-90deg-right text-xs text-amber-300';
        }

        if (item.kind === 'post') {
            return 'arrow-return-right text-xs text-emerald-300';
        }

        return 'arrow-right text-sm text-sky-300';
    }

    protected timelineColor(item: TaskTimelineItem): string {
        if (item.kind === 'pre') {
            return 'border-amber-500/30 bg-amber-950/20';
        }

        if (item.kind === 'post') {
            return 'border-emerald-500/30 bg-emerald-950/20';
        }

        return 'border-sky-500/30 bg-sky-950/20';
    }

    protected isAttachedStep(item: TaskTimelineItem): boolean {
        return item.kind === 'pre' || item.kind === 'post';
    }

    protected timelineCardClass(item: TaskTimelineItem, itemIndex: number): string {
        if (item.kind === 'pre') {
            const isFirstPre = this.isFirstPreStep(item, itemIndex);

            let classes = 'relative ml-6 rounded-none border border-b-0 p-4';
            if (isFirstPre) {
                classes += ' rounded-t-lg';
            }

            return classes;
        }

        if (item.kind === 'post') {
            const isFirstPost = this.isFirstPostStep(item, itemIndex);
            const isLastPost = this.isLastPostStep(item, itemIndex);

            let classes = 'relative ml-6 rounded-none border p-4';
            if (isFirstPost) {
                classes += ' border-t-0';
            }
            if (isLastPost) {
                classes += ' rounded-b-lg';
            }

            return classes;
        }

        const hasPreSteps = this.hasPreStepsForMain(item, itemIndex);
        const hasPostSteps = this.hasPostStepsForMain(item, itemIndex);

        let classes = 'relative rounded-xl border p-4';
        if (hasPreSteps) {
            classes += ' rounded-tr-none';
        }
        if (hasPostSteps) {
            classes += ' rounded-br-none';
        }

        return classes;
    }

    protected isTimelineItemCollapsed(item: TaskTimelineItem): boolean {
        const collapsed = this.collapsedTimelineItemIds()[item.id];
        if (collapsed !== undefined) {
            return collapsed;
        }

        return item.kind === 'pre' || item.kind === 'post';
    }

    protected toggleTimelineItemCollapse(item: TaskTimelineItem): void {
        this.collapsedTimelineItemIds.update((state) => ({
            ...state,
            [item.id]: !this.isTimelineItemCollapsed(item),
        }));
    }

    protected shouldShowCycleSeparator(current: TaskTimelineItem, next?: TaskTimelineItem): boolean {
        if (!next) {
            return false;
        }

        return current.kind === 'post' && next.kind === 'pre' && current.mainStepIndex !== next.mainStepIndex;
    }

    private isFirstPostStep(item: TaskTimelineItem, itemIndex: number): boolean {
        if (item.kind !== 'post') {
            return false;
        }

        const previous = this.timeline()[itemIndex - 1];
        return (
            !previous ||
            previous.kind !== 'post' ||
            previous.mainStepIndex !== item.mainStepIndex
        );
    }

    private isFirstPreStep(item: TaskTimelineItem, itemIndex: number): boolean {
        if (item.kind !== 'pre') {
            return false;
        }

        const previous = this.timeline()[itemIndex - 1];
        return (
            !previous ||
            previous.kind !== 'pre' ||
            previous.mainStepIndex !== item.mainStepIndex
        );
    }

    private isLastPostStep(item: TaskTimelineItem, itemIndex: number): boolean {
        if (item.kind !== 'post') {
            return false;
        }

        const next = this.timeline()[itemIndex + 1];
        return (
            !next ||
            next.kind !== 'post' ||
            next.mainStepIndex !== item.mainStepIndex
        );
    }

    private hasPreStepsForMain(item: TaskTimelineItem, itemIndex: number): boolean {
        if (item.kind !== 'main') {
            return false;
        }

        const previous = this.timeline()[itemIndex - 1];
        return !!previous && previous.kind === 'pre' && previous.mainStepIndex === item.mainStepIndex;
    }

    private hasPostStepsForMain(item: TaskTimelineItem, itemIndex: number): boolean {
        if (item.kind !== 'main') {
            return false;
        }

        const next = this.timeline()[itemIndex + 1];
        return !!next && next.kind === 'post' && next.mainStepIndex === item.mainStepIndex;
    }
}
