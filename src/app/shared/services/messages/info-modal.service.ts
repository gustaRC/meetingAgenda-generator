import { Injectable } from '@angular/core';
import { ConfirmationService, ConfirmEventType } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class InfoModalService {

  constructor(
    private confirmationService: ConfirmationService
  ) { }

  showConfirm(
    header: string,
    message?: string,
    severity: 'success' | 'info' | 'warn' | 'error' = 'info'
  ) {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: message,
        header: header,
        rejectVisible: true,
        icon: this.getIcon(severity),
        accept: () => resolve(true),
        reject: (type: any) => {
          if (type === ConfirmEventType.REJECT) resolve(false);
          else resolve(false);
        }
      });
    });
  }

  showInfo(
    header: string,
    message?: string,
    severity: 'success' | 'info' | 'warn' | 'error' = 'info',
  ) {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: message,
        header: header,
        rejectVisible: false,
        icon: this.getIcon(severity),
        accept: () => resolve(true),
        reject: (type: any) => {
          if (type === ConfirmEventType.REJECT) resolve(false);
          else resolve(false);
        }
      });
    });
  }

  private getIcon(severity: string): string {
    switch (severity) {
      case 'success': return 'pi pi-check-circle text-green-400';
      case 'info': return 'pi pi-info-circle text-blue-400';
      case 'warn': return 'pi pi-exclamation-triangle text-yellow-400';
      case 'error': return 'pi pi-times-circle text-red-400';
      default: return 'pi pi-info-circle text-gray-400';
    }
  }

}
