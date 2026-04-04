import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Services
import { FirestoreService } from '../../core/services/firestore.service';
import { AuthService } from '../../core/services/auth.service';
import { DriveService } from '../../core/services/drive.service';
import { UserConfig } from '../../shared/interfaces/userConfig.interface';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    DividerModule,
    ProgressSpinnerModule,
    MessageModule,
    TooltipModule,
  ],
  providers: [MessageService],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit{

  private firestoreService = inject(FirestoreService);
  private authService      = inject(AuthService);
  private driveService     = inject(DriveService);
  private messageService   = inject(MessageService);

  // ── Estado do formulário ──────────────────────────────────────────────────
  driveRootFolderId  = signal('');
  ultimoDriveFileId  = signal('');
  supervisorEmail    = signal('');

  // ── Estado de UI ──────────────────────────────────────────────────────────
  carregando       = signal(false);
  salvando         = signal(false);
  validandoDrive   = signal(false);
  pastaValidada    = signal<boolean | null>(null);
  arquivoValidado  = signal<boolean | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    this.carregando.set(true);
    try {
      const config = await this.firestoreService.getUserConfig();
      if (config) {
        this.driveRootFolderId.set(config.driveRootFolderId ?? '');
        this.ultimoDriveFileId.set(config.ultimoDriveFileId ?? '');
        this.supervisorEmail.set(config.supervisorEmail ?? '');
      }
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível carregar as configurações.',
      });
    } finally {
      this.carregando.set(false);
    }
  }

  // ── Validar pasta no Drive ────────────────────────────────────────────────
  async validarPasta(): Promise<void> {
    const id = this.driveRootFolderId().trim();
    if (!id) return;

    this.validandoDrive.set(true);
    this.pastaValidada.set(null);
    try {
      const existe = await this.driveService.validarPasta(id);
      this.pastaValidada.set(existe);
      if (!existe) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Pasta não encontrada',
          detail: 'Verifique se o ID está correto e se você tem acesso à pasta.',
        });
      }
    } catch {
      this.pastaValidada.set(false);
    } finally {
      this.validandoDrive.set(false);
    }
  }

  // ── Validar arquivo base no Drive ─────────────────────────────────────────
  async validarArquivo(): Promise<void> {
    const id = this.ultimoDriveFileId().trim();
    if (!id) return;

    this.validandoDrive.set(true);
    this.arquivoValidado.set(null);
    try {
      const existe = await this.driveService.validarArquivo(id);
      this.arquivoValidado.set(existe);
      if (!existe) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Arquivo não encontrado',
          detail: 'Verifique se o ID está correto e se você tem acesso ao arquivo.',
        });
      }
    } catch {
      this.arquivoValidado.set(false);
    } finally {
      this.validandoDrive.set(false);
    }
  }

  // ── Salvar configurações ──────────────────────────────────────────────────
  async salvar(): Promise<void> {
    const config: Partial<UserConfig> = {
      driveRootFolderId: this.driveRootFolderId().trim(),
      supervisorEmail:   this.supervisorEmail().trim(),
      ultimoDriveFileId: this.ultimoDriveFileId().trim(),
    };

    this.salvando.set(true);
    try {
      await this.firestoreService.saveUserConfig(config);
      this.messageService.add({
        severity: 'success',
        summary: 'Salvo!',
        detail: 'Configurações salvas com sucesso.',
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível salvar. Tente novamente.',
      });
    } finally {
      this.salvando.set(false);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Extrai o ID de uma URL do Google Drive colada pelo usuário */
  extrairIdDaUrl(url: string): string {
    // Suporta formatos:
    // https://drive.google.com/drive/folders/{ID}
    // https://docs.google.com/document/d/{ID}/edit
    // ID puro (sem URL)
    const pastaMatch  = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    const arquivoMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return pastaMatch?.[1] ?? arquivoMatch?.[1] ?? url.trim();
  }

  onPastaInput(valor: string): void {
    this.pastaValidada.set(null);
    this.driveRootFolderId.set(this.extrairIdDaUrl(valor));
  }

  onArquivoInput(valor: string): void {
    this.arquivoValidado.set(null);
    this.ultimoDriveFileId.set(this.extrairIdDaUrl(valor));
  }

  abrirDrive(): void {
    window.open('https://drive.google.com', '_blank');
  }

}
