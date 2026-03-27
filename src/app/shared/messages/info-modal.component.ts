import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'info-modal',
  imports: [
    CommonModule,
    DialogModule,
    ConfirmDialog,
    ButtonModule
  ],
  template: `
    <p-confirmDialog
    [style]="{ width: '30rem' }"
    [closable]="false">
      <ng-template #headless let-message let-onAccept="onAccept" let-onReject="onReject">
        <div class="flex flex-col items-center p-8 bg-default">
            <i style="font-size: 3.5rem;" [class]="message.icon" class="text-6xl"></i>
            <span style="font-size: 1.2rem;" class="font-bold text-center block mb-2 mt-8">{{ message.header }}</span>
            <p class="mb-0">{{ message.message }}</p>
            <div class="flex items-center gap-6 mt-8">
              <p-button label="Cancelar"
              *ngIf="message.rejectVisible"
              severity="secondary"
              styleClass="w-32"
              [outlined]="true"
              (onClick)="onReject()" />
              <p-button [label]="message.rejectVisible ? 'Confirmar' : 'Ok'"
              severity="primary"
              styleClass="w-32"
              (onClick)="onAccept()" />
            </div>
        </div>
      </ng-template>

    </p-confirmDialog>
  `,
  styles: ``
})
export class InfoModal { }
