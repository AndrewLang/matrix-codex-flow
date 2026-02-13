import { Injectable, OnDestroy } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class ShortcutService implements OnDestroy {
    private handlers = new Map<string, () => void>();

    constructor() {
        window.addEventListener('keydown', this.trigger.bind(this));
    }

    ngOnDestroy(): void {
        window.removeEventListener('keydown', this.trigger.bind(this));
        this.handlers.clear();
    }

    register(key: string, handler: () => void) {
        this.handlers.set(key, handler);
    }

    unregister(key: string) {
        this.handlers.delete(key);
    }

    trigger(event: KeyboardEvent) {
        const key = `${event.ctrlKey ? 'ctrl+' : ''}${event.key.toLowerCase()}`;
        const handler = this.handlers.get(key);
        if (handler) {
            event.preventDefault();
            handler();
        }
    }
}