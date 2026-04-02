import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

import { CardModule } from 'primeng/card';
import { GlobalToasts } from '../shared/messages/global-toast.component';
import { InfoModal } from '../shared/messages/info-modal.component';
import { LoadingModal } from '../shared/messages/loading.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    GlobalToasts,
    InfoModal,
  ],
  exports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    GlobalToasts,
    LoadingModal,
    InfoModal
  ]
})
export class CoreModule { }
