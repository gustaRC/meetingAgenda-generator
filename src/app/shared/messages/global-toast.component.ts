import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'global-toasts',
  imports: [
    ToastModule,
    CommonModule
  ],
  standalone: true,
  template: `
    <p-toast
    [breakpoints]="{ '480px': { width: '100%', right: '-20px', left: '0', top: '15px' } }"
    showTransformOptions="translateX(100%)"
    hideTransformOptions="translateX(0%)"
    styleClass="shadow-md">
      <ng-template let-message #headless let-closeFn="closeFn">
        <div class="flex items-center p-4 bg-default shadow-lg border-l-4 rounded-sm w-full relative mb-3"
        [ngClass]="getSeverityClass(message.severity)">
          <i style="font-size: 2rem;" class="pi mr-4" [ngClass]="getIcon(message.severity)"></i>
          <div class="flex-1">
            <div class="text-lg font-bold text-title-toast">{{ message.summary }}</div>
            <div class="text-base text-desc-toast">{{ message.detail }}</div>
          </div>

          <button
          class="ml-4 text-gray-400 hover:text-gray-500 text-xl leading-none focus:outline-none"
          (click)="closeFn($event)">
            &times;
          </button>
        </div>
      </ng-template>
    </p-toast>
  `,
  styles: `
    :host ::ng-deep .p-toast {
      background: transparent !important;
      box-shadow: none !important;
      padding: 0 !important;
      margin: 0 !important;
      margin-top: 2.3rem !important;
      marbing-bottom: 3rem !important;
      width: 30rem !important;
      right: 15px !important;
    }

    :host ::ng-deep .p-toast-message {
      background: transparent !important;
      box-shadow: none !important;
      border: none !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    :host ::ng-deep .p-toast-close-icon {
      display: none !important;
    }
  `
})
export class GlobalToasts {

  protected getSeverityClass(severity: string): string {
    switch (severity) {
      case 'success': return 'border-green-500';
      case 'info': return 'border-blue-500';
      case 'warn': return 'border-yellow-500';
      case 'error': return 'border-red-500';
      default: return 'border-gray-400';
    }
  }

  protected getIcon(severity: string): string {
    switch (severity) {
      case 'success': return 'pi-check-circle text-green-500';
      case 'info': return 'pi-info-circle text-blue-500';
      case 'warn': return 'pi-exclamation-triangle text-yellow-500';
      case 'error': return 'pi-times-circle text-red-500';
      default: return 'pi-info-circle text-gray-400';
    }
  }

}
