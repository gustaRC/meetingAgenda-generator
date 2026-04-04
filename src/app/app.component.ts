import { Component, inject, signal, effect } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Auth } from '@angular/fire/auth';
import { authState } from '@angular/fire/auth';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';

import { AuthService } from './core/services/auth.service';

// Interfaces
import { NavItem } from './shared/interfaces/navItem.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ButtonModule,
    TooltipModule,
    AvatarModule,
    DividerModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private auth        = inject(Auth);
  private authService = inject(AuthService);
  private router      = inject(Router);

  // ── Estado ────────────────────────────────────────────────────────────────
  isLoggedIn    = signal(false);
  rotaAtual     = signal('');
  userFotoUrl   = signal<string | null>(null);
  userNome      = signal<string | null>(null);
  userIniciais  = signal('?');

  // ── Navegação lateral ─────────────────────────────────────────────────────
  readonly navItems: NavItem[] = [
    { label: 'Nova Pauta',    icon: 'pi pi-file-edit',  route: '/nova-pauta',    tooltip: 'Nova Pauta'    },
    { label: 'Histórico',     icon: 'pi pi-history',    route: '/historico',     tooltip: 'Histórico'     },
    { label: 'Configurações', icon: 'pi pi-sliders-h',  route: '/configuracoes', tooltip: 'Configurações' },
  ];

  constructor() {
    // Observa mudanças de autenticação
    authState(this.auth).subscribe(user => {
      this.isLoggedIn.set(!!user);
      if (user) {
        this.userFotoUrl.set(user.photoURL);
        this.userNome.set(user.displayName);
        this.userIniciais.set(this.gerarIniciais(user.displayName));
      } else {
        this.userFotoUrl.set(null);
        this.userNome.set(null);
        this.userIniciais.set('?');
      }
    });

    // Observa a rota atual para destacar o item ativo no menu
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => this.rotaAtual.set((e as NavigationEnd).urlAfterRedirects));
  }

  // ── Métodos ───────────────────────────────────────────────────────────────
  navegarPara(route: string): void {
    this.router.navigate([route]);
  }

  isAtivo(route: string): boolean {
    return this.rotaAtual().startsWith(route);
  }

  async sair(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  private gerarIniciais(nome: string | null): string {
    if (!nome) return '?';
    const partes = nome.trim().split(' ').filter(Boolean);
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
}
