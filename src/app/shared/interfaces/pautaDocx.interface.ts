import { Pauta } from "./pauta.interface";

export interface PautaDocx extends Omit<Pauta,
  'id' | 'criadaEm' | 'driveFileId' | 'driveFileUrl' | 'compartilhadoCom'> {}
