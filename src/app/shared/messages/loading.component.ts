import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { LoadingService } from '../../services/messages/loading.service';
import { CommonModule } from '@angular/common';
import { LoadingAnimation } from './loading-animation.component';

@Component({
  selector: 'loading-modal',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    LoadingAnimation
  ],
  template: `
    <p-dialog
    [visible]="(loadingService.loading$ | async) ?? false"
    [modal]="true"
    [closable]="false"
    [draggable]="false"
    [resizable]="false"
    [style]="{ width: '30rem' }"
    [contentStyle]="{ padding: '1.5rem', textAlign: 'center' }">
      <loading-animation [message]="loadingService.loadingMessage" />
      <ng-template #footer>
        <span class="loader-progress"></span>
      </ng-template>
    </p-dialog>
  `,
  styles: `
    :host ::ng-deep .p-dialog-header {
      padding: 0 !important;
    }
    :host ::ng-deep .p-dialog-footer {
      padding: 0 !important;
    }
  `
})
export class LoadingModal {

  constructor(
    public loadingService: LoadingService
  ) {}

}
