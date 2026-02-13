import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavService } from '../../services/nav.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationComponent } from '../notification/notification.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
    selector: 'mtx-app-layout',
    templateUrl: 'app.layout.component.html',
    imports: [RouterModule, SidebarComponent, NotificationComponent]
})
export class AppLayoutComponent implements OnInit {
    private readonly notificationService = inject(NotificationService);
    private readonly navService = inject(NavService);

    readonly navItems = computed(() => this.navService.navItems);
    readonly bottomNavItems = computed(() => this.navService.bottomNavItems);
    readonly notification = this.notificationService.notification;

    constructor() { }

    ngOnInit() { }
}