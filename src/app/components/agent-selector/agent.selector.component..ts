import { Component, ElementRef, HostListener, inject, model, OnInit, signal, viewChild } from '@angular/core';
import { AgentConfig } from '../../models/agent.provider';
import { AgentConfigViewModel } from '../../models/agents';
import { SettingKeys } from '../../models/setting.model';
import { SettingService } from '../../services/setting.service';
import { SvgComponent } from '../icon/svg.component';

@Component({
    selector: 'mtx-agent-selector',
    templateUrl: 'agent.selector.component.html',
    imports: [SvgComponent]
})
export class AgentSelectorComponent implements OnInit {
    private readonly settingService = inject(SettingService);
    private readonly dropdownDetails = viewChild<ElementRef<HTMLDetailsElement>>('dropdownDetails');
    private readonly dropdownPanel = viewChild<ElementRef<HTMLDivElement>>('dropdownPanel');
    readonly openUpward = signal(false);

    agents = signal<AgentConfigViewModel[]>([]);
    selectedAgent = model<AgentConfigViewModel | null>(null);

    constructor() { }

    async ngOnInit() {
        await this.settingService.load();
        let appSetting = this.settingService.appSetting();
        let agents = appSetting.getSettingValue<AgentConfig[]>(SettingKeys.AGENT_CONFIGS_SETTING);
        this.agents.set(agents?.map(agent => ({ ...agent })) ?? []);

        let defaultAgent = this.agents()?.find(agent => agent.isDefault) ?? this.agents()?.[0] ?? null;
        if (defaultAgent) {
            defaultAgent.isSelected = true;
        }
        this.selectedAgent.set(defaultAgent);
    }

    selectAgent(agent: AgentConfigViewModel): void {
        this.agents().forEach(a => a.isSelected = false);
        agent.isSelected = true;
        this.selectedAgent.set(agent);
        this.closeDropdown();
    }

    onDropdownToggle(): void {
        const detailsElement = this.dropdownDetails()?.nativeElement;
        if (!detailsElement?.open) {
            return;
        }

        this.updateDropdownDirection();
    }

    @HostListener('window:resize')
    onWindowResize(): void {
        const detailsElement = this.dropdownDetails()?.nativeElement;
        if (!detailsElement?.open) {
            return;
        }

        this.updateDropdownDirection();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const detailsElement = this.dropdownDetails()?.nativeElement;
        if (!detailsElement?.open) {
            return;
        }

        const targetNode = event.target as Node | null;
        if (!targetNode || detailsElement.contains(targetNode)) {
            return;
        }

        detailsElement.open = false;
    }

    closeDropdown(): void {
        const detailsElement = this.dropdownDetails()?.nativeElement;
        if (!detailsElement) {
            return;
        }

        detailsElement.open = false;
    }

    private updateDropdownDirection(): void {
        const detailsElement = this.dropdownDetails()?.nativeElement;
        const panelElement = this.dropdownPanel()?.nativeElement;
        if (!detailsElement || !panelElement) {
            return;
        }

        const detailsRect = detailsElement.getBoundingClientRect();
        const panelHeight = panelElement.offsetHeight || 220;
        const spacing = 8;

        const availableBelow = window.innerHeight - detailsRect.bottom - spacing;
        const availableAbove = detailsRect.top - spacing;
        const shouldOpenUpward = availableBelow < panelHeight && availableAbove > availableBelow;

        this.openUpward.set(shouldOpenUpward);
    }
}
