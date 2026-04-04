import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from, map } from 'rxjs';

// Interfaces
import { Template } from '../../shared/interfaces/template.interface';
import { Pauta } from '../../shared/interfaces/pauta.interface';
import { ItemPauta } from '../../shared/interfaces/itemPauta.interface';
import { UserConfig } from '../../shared/interfaces/userConfig.interface';

@Injectable({ providedIn: 'root' })
export class FirestoreService {

  constructor(
    private firestore: Firestore,
    private auth: Auth,
  ) {}

  // ── Helpers ──────────────────────────────

  private get uid(): string {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('Usuário não autenticado.');
    return uid;
  }

  private userDocRef() {
    return doc(this.firestore, `users/${this.uid}`);
  }

  private templatesColRef() {
    return collection(this.firestore, `templates/${this.uid}/items`);
  }

  private templateDocRef(templateId: string) {
    return doc(this.firestore, `templates/${this.uid}/items/${templateId}`);
  }

  private pautasColRef() {
    return collection(this.firestore, `pautas/${this.uid}/items`);
  }

  private pautaDocRef(pautaId: string) {
    return doc(this.firestore, `pautas/${this.uid}/items/${pautaId}`);
  }

  // ── UserConfig ────────────────────────────

  /** Retorna as configurações do usuário (pasta Drive, supervisor, etc.) */
  async getUserConfig(): Promise<UserConfig | null> {
    const snap = await getDoc(this.userDocRef());
    return snap.exists() ? (snap.data() as UserConfig) : null;
  }

  /** Cria ou atualiza as configurações do usuário */
  async saveUserConfig(config: Partial<UserConfig>): Promise<void> {
    await setDoc(this.userDocRef(), config, { merge: true });
  }

  // ── Templates ─────────────────────────────

  /** Retorna todos os templates do usuário como Observable */
  getTemplates(): Observable<Template[]> {
    const q = query(this.templatesColRef(), orderBy('atualizadoEm', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Template[]>;
  }

  /** Retorna o último template usado (para pré-preencher nova pauta) */
  async getUltimoTemplate(): Promise<Template | null> {
    const config = await this.getUserConfig();
    if (config?.ultimoTemplateId) {
      const snap = await getDoc(this.templateDocRef(config.ultimoTemplateId));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Template;
      }
    }

    // fallback: pega o mais recente
    const q = query(this.templatesColRef(), orderBy('atualizadoEm', 'desc'), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, ...d.data() } as Template;
    }

    return null;
  }

  /** Cria um novo template */
  async createTemplate(template: Omit<Template, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<string> {
    const ref = await addDoc(this.templatesColRef(), {
      ...template,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
    return ref.id;
  }

  /** Atualiza um template existente */
  async updateTemplate(templateId: string, data: Partial<Template>): Promise<void> {
    await updateDoc(this.templateDocRef(templateId), {
      ...data,
      atualizadoEm: serverTimestamp(),
    });
  }

  /** Remove um template */
  async deleteTemplate(templateId: string): Promise<void> {
    await deleteDoc(this.templateDocRef(templateId));
  }

  // ── Pautas ────────────────────────────────

  /** Retorna o histórico de pautas como Observable (mais recentes primeiro) */
  getPautas(): Observable<Pauta[]> {
    const q = query(this.pautasColRef(), orderBy('criadaEm', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Pauta[]>;
  }

  /** Retorna as últimas N pautas */
  getUltimasPautas(quantidade = 5): Observable<Pauta[]> {
    const q = query(this.pautasColRef(), orderBy('criadaEm', 'desc'), limit(quantidade));
    return collectionData(q, { idField: 'id' }) as Observable<Pauta[]>;
  }

  /** Salva uma pauta gerada no histórico e atualiza config do usuário */
  async savePauta(pauta: Omit<Pauta, 'id' | 'criadaEm'>): Promise<string> {
    const ref = await addDoc(this.pautasColRef(), {
      ...pauta,
      criadaEm: serverTimestamp(),
    });

    // Atualiza o último arquivo Drive usado (para copiar na próxima pauta)
    await this.saveUserConfig({ ultimoDriveFileId: pauta.driveFileId });

    return ref.id;
  }

  /** Calcula o total de minutos de uma lista de itens */
  calcularTotalMinutos(itens: ItemPauta[]): number {
    return itens.reduce((acc, item) => acc + (item.duracao ?? 0), 0);
  }

  /** Formata minutos em string legível (ex: "1h 25min") */
  formatarDuracao(minutos: number): string {
    if (minutos < 60) return `${minutos}min`;
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }
}
