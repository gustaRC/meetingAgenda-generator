import { Timestamp } from "firebase/firestore";
import { ItemPauta } from "./itemPauta.interface";

export interface Template {
  id?: string;
  nome: string;
  participantes: string[];
  horario: string;         // ex: "09:00"
  local: string;
  itens: ItemPauta[];
  criadoEm?: Timestamp;
  atualizadoEm?: Timestamp;
}
