import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalService {
    private readonly storage: Storage | null =
        typeof window !== 'undefined' ? window.localStorage : null;

    constructor() { }

    setItem<T>(key: string, value: T): void {
        if (!this.storage || !key?.trim()) {
            return;
        }

        try {
            this.storage.setItem(key, JSON.stringify(value));
        } catch {
            return;
        }
    }

    getItem<T>(key: string, defaultValue?: T): T | undefined {
        if (!this.storage || !key?.trim()) {
            return defaultValue;
        }

        const rawValue = this.storage.getItem(key);
        if (rawValue === null) {
            return defaultValue;
        }

        try {
            return JSON.parse(rawValue) as T;
        } catch {
            return defaultValue;
        }
    }

    removeItem(key: string): void {
        if (!this.storage || !key?.trim()) {
            return;
        }

        this.storage.removeItem(key);
    }

    hasItem(key: string): boolean {
        if (!this.storage || !key?.trim()) {
            return false;
        }

        return this.storage.getItem(key) !== null;
    }

    clear(): void {
        if (!this.storage) {
            return;
        }

        this.storage.clear();
    }
}
