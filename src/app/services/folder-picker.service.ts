import { Injectable } from '@angular/core';

export abstract class FolderPickerService {
  abstract pickFolder(): Promise<string | null>;
}

@Injectable({
  providedIn: 'root',
})
export class StubFolderPickerService implements FolderPickerService {
  async pickFolder(): Promise<string | null> {
    return 'D:\\Code\\SampleProject';
  }
}
