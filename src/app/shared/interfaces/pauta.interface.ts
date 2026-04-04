import { Timestamp } from "firebase/firestore";
import { ItemPauta } from "./itemPauta.interface";

export interface Pauta {
  id?: string;
  assunto: string;
  participantes: string[];
  horario: string;
  local: string;
  itens: ItemPauta[];
  totalMinutos: number;
  responsaveis: string[];
  driveFileId: string;
  driveFileUrl: string;
  compartilhadoCom: string[];
  criadaEm?: Timestamp;
}
