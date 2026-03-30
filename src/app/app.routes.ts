import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { NewAgendaComponent } from './pages/new-agenda/new-agenda.component';
import { authGuard } from './core/guards/auth.guard';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // protegido com auth.guard:
  { path: 'nova-pauta', component: NewAgendaComponent, canActivate: [authGuard] },
  { path: 'configuracoes', component: SettingsComponent, canActivate: [authGuard] },
];
