import { Component, inject, model, OnInit, signal } from '@angular/core';

import { AppSetting, SettingKeys } from '../../models/setting.model';
import { SettingService } from '../../services/setting.service';
import { IconComponent } from "../icon/icon.component";
import { MarkdownEditorComponent } from '../md-editor/md.editor.component';

@Component({
    selector: 'mtx-template-settings',
    templateUrl: 'template.settings.component.html',
    imports: [MarkdownEditorComponent, IconComponent],
})
export class TemplateSettingsComponent implements OnInit {
    private readonly settingService = inject(SettingService);

    readonly appSetting = model.required<AppSetting>()
    readonly promptTemplate = signal<string>('');

    isExpanded = signal(false);

    ngOnInit() {
        let setting = this.appSetting().getSetting<string>(SettingKeys.PROMPT_TEMPLATE_SETTING);
        this.promptTemplate.set(setting?.toString() || '');
    }

    toggleExpanded(): void {
        this.isExpanded.set(!this.isExpanded());
    }

    setPromptTemplate(value: string): void {
        this.promptTemplate.set(value);
        this.appSetting().updateSetting(SettingKeys.PROMPT_TEMPLATE_SETTING, value);
    }
}
