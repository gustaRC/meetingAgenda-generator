import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

// Services
import { FirestoreService } from '../../core/services/firestore.service';
import { DriveService } from '../../core/services/drive.service';
import { AuthService } from '../../core/services/auth.service';
import { DocxGeneratorService } from '../../core/services/docx-generator-service.service';

// Interfaces
import { ItemPauta } from '../../shared/interfaces/itemPauta.interface';
import { UserConfig } from '../../shared/interfaces/userConfig.interface';
import { Template } from '../../shared/interfaces/template.interface';

// ─── Duração pré-definida em minutos ───────────────────────────────────────
const DURACOES = [
  { label: '5min',  value: 5  },
  { label: '10min', value: 10 },
  { label: '15min', value: 15 },
  { label: '20min', value: 20 },
  { label: '25min', value: 25 },
  { label: '30min', value: 30 },
  { label: '45min', value: 45 },
  { label: '60min', value: 60 },
];

@Component({
  selector: 'app-new-agenda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ChipModule,
    DividerModule,
    SelectButtonModule,
    ToastModule,
    ProgressSpinnerModule,
    TagModule,
    TextareaModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  providers: [MessageService],
  templateUrl: './new-agenda.component.html',
  styleUrl: './new-agenda.component.scss'
})
export class NewAgendaComponent implements OnInit {

  private firestoreService = inject(FirestoreService);
  private driveService     = inject(DriveService);
  private authService      = inject(AuthService);
  private messageService   = inject(MessageService);
  private docxGenerator = inject(DocxGeneratorService);

  // ── Estado do formulário ──────────────────────────────────────────────────
  assunto      = signal('');
  horario      = signal('10:30');
  local        = signal('');
  responsaveis = signal('');           // string separada por vírgula
  novoParticipante = signal('');

  participantes = signal<string[]>([]);
  itens         = signal<ItemPauta[]>([]);

  // ── Estado de UI ──────────────────────────────────────────────────────────
  carregando      = signal(false);
  gerandoDrive    = signal(false);
  driveUrl        = signal<string | null>(null);
  userConfig      = signal<UserConfig | null>(null);

  // ── Computed ──────────────────────────────────────────────────────────────
  totalMinutos = computed(() =>
    this.itens().reduce((acc, item) => acc + (item.duracao ?? 0), 0)
  );

  totalFormatado = computed(() =>
    this.firestoreService.formatarDuracao(this.totalMinutos())
  );

  formularioValido = computed(() =>
    this.assunto().trim().length > 0 &&
    this.itens().length > 0 &&
    !!this.userConfig()?.driveRootFolderId
  );

  readonly duracoes = DURACOES;

  // ─────────────────────────────────────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    this.carregando.set(true);
    try {
      // Carrega config do usuário (pasta Drive, supervisor)
      const config = await this.firestoreService.getUserConfig();
      this.userConfig.set(config);

      if (!config?.driveRootFolderId) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Configuração pendente',
          detail: 'Defina a pasta raiz do Drive em Configurações antes de criar pautas.',
          life: 6000,
        });
      }

      // Pré-preenche com o último template usado
      const template = await this.firestoreService.getUltimoTemplate();
      if (template) this.aplicarTemplate(template);

    } catch (e) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar dados iniciais.' });
    } finally {
      this.carregando.set(false);
    }
  }

  // ── Template ──────────────────────────────────────────────────────────────
  private aplicarTemplate(t: Template): void {
    this.horario.set(t.horario ?? '09:00');
    this.local.set(t.local ?? '');
    this.participantes.set([...t.participantes]);
    this.itens.set(t.itens.map(i => ({ ...i })));
  }

  // ── Participantes ─────────────────────────────────────────────────────────
  adicionarParticipante(): void {
    const nome = this.novoParticipante().trim();
    if (!nome) return;
    if (this.participantes().includes(nome)) {
      this.messageService.add({ severity: 'warn', summary: 'Duplicado', detail: `"${nome}" já está na lista.` });
      return;
    }
    this.participantes.update(list => [...list, nome]);
    this.novoParticipante.set('');
  }

  removerParticipante(nome: string): void {
    this.participantes.update(list => list.filter(p => p !== nome));
  }

  onParticipanteKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.adicionarParticipante();
    }
  }

  // ── Itens da pauta ────────────────────────────────────────────────────────
  adicionarItem(): void {
    this.itens.update(list => [
      ...list,
      { titulo: '', duracao: 10, subitem: '' },
    ]);
  }

  removerItem(index: number): void {
    this.itens.update(list => list.filter((_, i) => i !== index));
  }

  moverItem(index: number, direcao: 'up' | 'down'): void {
    const list = [...this.itens()];
    const alvo = direcao === 'up' ? index - 1 : index + 1;
    if (alvo < 0 || alvo >= list.length) return;
    [list[index], list[alvo]] = [list[alvo], list[index]];
    this.itens.set(list);
  }

  atualizarItem(index: number, campo: keyof ItemPauta, valor: string | number): void {
    this.itens.update(list => {
      const nova = [...list];
      nova[index] = { ...nova[index], [campo]: valor };
      return nova;
    });
  }

  // ── Gerar pauta no Drive ──────────────────────────────────────────────────
  async gerarNoDrive(): Promise<void> {
    if (!this.formularioValido()) return;

    const config = this.userConfig()!;

    this.gerandoDrive.set(true);
    this.driveUrl.set(null);

    try {
      // 1. Garante que a pasta do mês existe
      const pastaId = await this.driveService.getOrCreateMonthFolder(config.driveRootFolderId);

      // 2. Gera o .docx localmente com todos os dados preenchidos
      const pautaData = {
        assunto:       this.assunto(),
        participantes: this.participantes(),
        horario:       this.horario(),
        local:         this.local(),
        itens:         this.itens(),
        totalMinutos:  this.totalMinutos(),
        responsaveis:  this.responsaveis().split(',').map(r => r.trim()).filter(Boolean),
      };

      const blob = await this.docxGenerator.gerarDocx(pautaData);

      // 3. Faz upload do .docx para a pasta do mês no Drive
      const nomeArquivo = `Pauta - ${this.assunto()} - ${this.formatarDataHoje()}`;
      const { id: fileId, url } = await this.driveService.uploadDocx(blob, nomeArquivo, pastaId);

      // 4. Compartilha com o supervisor
      if (config.supervisorEmail) {
        await this.driveService.shareFile(fileId, config.supervisorEmail);
      }

      // 5. Salva no histórico do Firestore
      await this.firestoreService.savePauta({
        ...pautaData,
        driveFileId:      fileId,
        driveFileUrl:     url,
        compartilhadoCom: config.supervisorEmail ? [config.supervisorEmail] : [],
      });

      this.driveUrl.set(url);

      this.messageService.add({
        severity: 'success',
        summary: 'Pauta criada!',
        detail: 'Documento gerado e enviado para o Google Drive.',
        life: 5000,
      });

    } catch (e: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro ao gerar pauta',
        detail: e?.message ?? 'Verifique as permissões do Google Drive.',
      });
    } finally {
      this.gerandoDrive.set(false);
    }
  }

  abrirNoDrive(): void {
    const url = this.driveUrl();
    if (url) window.open(url, '_blank');
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private formatarDataHoje(): string {
    const hoje = new Date();
    return hoje.toLocaleDateString('pt-BR'); // ex: 27/03/2026
  }

  trackByIndex(index: number): number {
    return index;
  }

}
