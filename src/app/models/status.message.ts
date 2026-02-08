export interface StatusMessage {
    content: string;
    type: 'info' | 'error' | 'success';
    timestamp: Date;
}