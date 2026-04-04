export interface UserConfig {
  driveRootFolderId: string;       // ID da pasta raiz das pautas no Drive
  supervisorEmail: string;         // E-mail do supervisor para compartilhar
  ultimoTemplateId?: string;       // ID do último template usado
  ultimoDriveFileId?: string;      // ID do último arquivo de pauta no Drive (para copiar)
}
