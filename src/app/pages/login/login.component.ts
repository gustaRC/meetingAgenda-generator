import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  carregando = signal(false);
  erro = signal<string | null>(null);

  async entrarComGoogle(): Promise<void> {
    this.erro.set(null);
    this.carregando.set(true);
    try {
      await this.authService.loginWithGoogle(); // TODO chamar diretamente no btn no html
      await this.router.navigate(['/nova-pauta']);
    } catch (e: any) {
      // Usuário fechou o popup — não é erro real
      if (e?.code === 'auth/popup-closed-by-user') {
        this.erro.set(null);
      } else {
        this.erro.set('Não foi possível fazer login. Tente novamente.');
      }
    } finally {
      this.carregando.set(false);
    }
  }
}
