import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";

// core/services/drive.service.ts
@Injectable({ providedIn: 'root' })
export class DriveService {
  private baseUrl = 'https://www.googleapis.com/drive/v3';
  private uploadUrl = 'https://www.googleapis.com/upload/drive/v3';

  constructor(private auth: AuthService) {}

  private get headers() {
    return { Authorization: `Bearer ${this.auth.getAccessToken()}` };
  }

  // Busca subpastas de uma pasta pai pelo nome
  async findFolder(parentId: string, name: string): Promise<string | null> {
    const query = `'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const res = await fetch(`${this.baseUrl}/files?q=${encodeURIComponent(query)}`, {
      headers: this.headers
    });
    const data = await res.json();
    return data.files?.[0]?.id ?? null;
  }

  // Cria uma pasta
  async createFolder(parentId: string, name: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/files`, {
      method: 'POST',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      })
    });
    const data = await res.json();
    return data.id;
  }

  // Garante que a pasta do mês existe (cria se não existir)
  async getOrCreateMonthFolder(rootId: string): Promise<string> {
    const now = new Date();
    const folderName = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`;
    const existing = await this.findFolder(rootId, folderName);
    return existing ?? await this.createFolder(rootId, folderName);
  }

  // Copia um arquivo
  async copyFile(fileId: string, newName: string, parentId: string): Promise<{id: string, url: string}> {
    const res = await fetch(`${this.baseUrl}/files/${fileId}/copy`, {
      method: 'POST',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, parents: [parentId] })
    });
    const data = await res.json();
    return { id: data.id, url: `https://docs.google.com/document/d/${data.id}/edit` };
  }

  // Compartilha com um e-mail
  async shareFile(fileId: string, email: string): Promise<void> {
    await fetch(`${this.baseUrl}/files/${fileId}/permissions`, {
      method: 'POST',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'user', role: 'writer', emailAddress: email })
    });
  }

   /** Verifica se uma pasta existe e é acessível */
  async validarPasta(folderId: string): Promise<boolean> {
    try {
      const res = await fetch(
        `${this.baseUrl}/files/${folderId}?fields=id,mimeType,trashed`,
        { headers: this.headers }
      );
      if (!res.ok) return false;
      const data = await res.json();
      return (
        data.mimeType === 'application/vnd.google-apps.folder' &&
        !data.trashed
      );
    } catch {
      return false;
    }
  }

  /** Verifica se um arquivo existe e é acessível */
  async validarArquivo(fileId: string): Promise<boolean> {
    try {
      const res = await fetch(
        `${this.baseUrl}/files/${fileId}?fields=id,mimeType,trashed`,
        { headers: this.headers }
      );
      if (!res.ok) return false;
      const data = await res.json();
      return !data.trashed && !!data.id;
    } catch {
      return false;
    }
  }

  /**
   * Faz upload de um Blob .docx para uma pasta do Drive e retorna o id e url do arquivo.
   * Usa multipart upload (metadata + binário em uma única requisição).
   */
  async uploadDocx(
    blob: Blob,
    fileName: string,
    parentFolderId: string
  ): Promise<{ id: string; url: string }> {

    const metadata = {
      name: fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      parents: [parentFolderId],
    };

    // Monta multipart/related com boundary
    const boundary = 'boundary_pauta_upload_' + Date.now();
    const metaPart =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify(metadata) +
      `\r\n`;
    const filePart =
      `--${boundary}\r\n` +
      `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n`;
    const closing = `\r\n--${boundary}--`;

    const body = new Blob([metaPart, filePart, blob, closing], {
      type: `multipart/related; boundary=${boundary}`,
    });

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.auth.getAccessToken()}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error?.message ?? 'Falha ao fazer upload para o Drive.');
    }

    const data = await res.json();
    const id = data.id as string;

    // URL de visualização no Google Drive (abre o .docx no Drive Viewer)
    const url = `https://drive.google.com/file/d/${id}/view`;

    return { id, url };
  }
}
