import { MessageService } from 'primeng/api';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastsService {

  constructor(
    private messageService: MessageService
  ) { }

  showSuccess(summary: string, detail: string) {
    this.messageService.add({ severity: 'success', closable: true, summary, detail });
  }

  showError(summary: string, detail: string) {
    this.messageService.add({ severity: 'error', closable: true, summary, detail });
  }

  showInfo(summary: string, detail: string) {
    this.messageService.add({ severity: 'info', closable: true , summary, detail });
  }

  showWarn(summary: string, detail: string) {
    this.messageService.add({ severity: 'warn', closable: true, summary, detail });
  }

  clear() {
    this.messageService.clear();
  }

}
