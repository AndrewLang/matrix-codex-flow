
export class IdGenerator {
    static generateId(): string {
        return crypto.randomUUID();
    }
}