import { Pipe, PipeTransform } from '@angular/core';

const TIMESTAMP_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit'
};

@Pipe({
    name: 'formatTimestamp',
    standalone: true
})
export class FormatTimestampPipe implements PipeTransform {
    transform(value: number): string {
        return new Intl.DateTimeFormat([], TIMESTAMP_FORMAT_OPTIONS).format(value);
    }
}
