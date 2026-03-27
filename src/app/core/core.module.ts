import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

import { LoginComponent } from '../pages/login/login.component';

import { CardModule } from 'primeng/card';
import { GlobalToasts } from '../shared/messages/global-toast.component';
import { LoadingModal } from '../shared/messages/loading.component';
import { InfoModal } from '../shared/messages/info-modal.component';

@NgModule({
  declarations: [
    LoginComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    LoginComponent,

    GlobalToasts,
    LoadingModal,
    InfoModal,

    CardModule
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
