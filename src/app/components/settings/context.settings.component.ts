import { Component, model, OnInit, signal } from '@angular/core';
import { AppSetting, SettingKeys } from '../../models/setting.model';

@Component({
    selector: 'mtx-context-settings',
    templateUrl: 'context.settings.component.html'
})
export class ContextSettingsComponent implements OnInit {
    appSetting = model.required<AppSetting>()

    protected readonly generateVibeflowFolder = signal(false);

    ngOnInit() {
        let value = this.appSetting().getSetting<boolean>(SettingKeys.GENERATE_FOLDER_SETTING);
        this.generateVibeflowFolder.set(value ?? false);
    }

    protected setGenerateVibeflowFolder(value: boolean): void {
        this.generateVibeflowFolder.set(value);
        this.appSetting().updateSetting(SettingKeys.GENERATE_FOLDER_SETTING, value);
    }
}