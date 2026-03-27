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
}
