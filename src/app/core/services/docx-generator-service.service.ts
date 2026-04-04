import { Injectable } from '@angular/core';
import {
  Document, Packer, Paragraph, TextRun,
  AlignmentType, LevelFormat, WidthType,
  BorderStyle,
} from 'docx';

// Interfaces
import { PautaDocx } from '../../shared/interfaces/pautaDocx.interface';

@Injectable({ providedIn: 'root' })
export class DocxGeneratorService {

  // ── Paleta de cores (extraída do template original) ──────────────────────
  private readonly COR_TITULO   = '366091';   // azul escuro — "Pauta de Reunião"
  private readonly COR_SECAO   = '4F81BD';   // azul médio — seções
  private readonly COR_TEXTO   = '000000';   // preto
  private readonly COR_AUTO    = 'auto';
  private readonly FONTE_TITULO = 'Calibri';
  private readonly FONTE_CORPO  = 'Cambria';

  // ─────────────────────────────────────────────────────────────────────────
  // API pública
  // ─────────────────────────────────────────────────────────────────────────

  /** Gera o Blob do .docx preenchido com os dados da pauta */
  async gerarDocx(pauta: PautaDocx): Promise<Blob> {
    const doc = new Document({
      numbering: {
        config: [
          {
            // Lista de participantes (bullet)
            reference: 'participantes',
            levels: [{
              level: 0,
              format: LevelFormat.BULLET,
              text: '-',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 360, hanging: 360 } } },
            }],
          },
          {
            // Lista de itens da pauta (bullet)
            reference: 'itens',
            levels: [{
              level: 0,
              format: LevelFormat.BULLET,
              text: '-',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 360, hanging: 360 } } },
            }],
          },
          {
            // Lista de totalizador/responsável (bullet)
            reference: 'rodape',
            levels: [{
              level: 0,
              format: LevelFormat.BULLET,
              text: '-',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            }],
          },
        ],
      },
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          ...this.cabecalho(pauta),
          ...this.secaoParticipantes(pauta.participantes),
          ...this.secaoPauta(pauta),
          ...this.rodape(pauta),
        ],
      }],
    });

    const buffer = await Packer.toBlob(doc);
    return buffer;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Seções do documento
  // ─────────────────────────────────────────────────────────────────────────

  private cabecalho(pauta: PautaDocx): Paragraph[] {
    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR');

    return [
      // "Pauta de Reunião" — título azul escuro bold
      new Paragraph({
        spacing: { before: 480, after: 0, line: 240 },
        keepNext: true,
        keepLines: true,
        children: [
          new TextRun({
            text: 'Pauta de Reunião',
            font: this.FONTE_TITULO,
            bold: true,
            color: this.COR_TITULO,
            size: 28,
          }),
        ],
      }),

      // Empresa Belt Sistemas
      new Paragraph({
        spacing: { before: 0, after: 200, line: 276 },
        children: [
          new TextRun({ text: 'Empresa ', font: this.FONTE_CORPO, color: this.COR_AUTO, size: 22 }),
          new TextRun({ text: 'Belt Sistemas',  font: this.FONTE_CORPO, color: this.COR_TEXTO, size: 22 }),
        ],
      }),

      // Data
      new Paragraph({
        spacing: { before: 0, after: 200, line: 276 },
        children: [
          new TextRun({
            text: `Data: ${dataFormatada}`,
            font: this.FONTE_CORPO,
            color: this.COR_AUTO,
            size: 22,
          }),
        ],
      }),

      // Horário
      new Paragraph({
        spacing: { before: 0, after: 200, line: 276 },
        children: [
          new TextRun({
            text: `Horário: ${pauta.horario}`,
            font: this.FONTE_CORPO,
            color: this.COR_AUTO,
            size: 22,
          }),
        ],
      }),

      // Local
      new Paragraph({
        spacing: { before: 0, after: 200, line: 276 },
        children: [
          new TextRun({
            text: `Local: ${pauta.local}`,
            font: this.FONTE_CORPO,
            color: this.COR_AUTO,
            size: 22,
          }),
        ],
      }),

      // Assunto — azul médio, bold, itálico, underline, indentado
      new Paragraph({
        spacing: { before: 200, after: 280, line: 276 },
        indent: { left: 936, right: 936 },
        children: [
          new TextRun({
            text: 'Assunto: ',
            font: this.FONTE_CORPO,
            bold: true,
            italics: true,
            color: this.COR_SECAO,
            size: 22,
            underline: {},
          }),
          new TextRun({
            text: pauta.assunto,
            font: this.FONTE_CORPO,
            bold: true,
            italics: true,
            color: this.COR_SECAO,
            size: 22,
            underline: {},
          }),
        ],
      }),
    ];
  }

  private secaoParticipantes(participantes: string[]): Paragraph[] {
    return [
      // Título "Participantes:"
      new Paragraph({
        spacing: { before: 200, after: 0, line: 240 },
        keepNext: true,
        keepLines: true,
        children: [
          new TextRun({
            text: 'Participantes:',
            font: this.FONTE_TITULO,
            bold: true,
            color: this.COR_SECAO,
            size: 26,
          }),
        ],
      }),

      // Um bullet por participante
      ...participantes.map(p =>
        new Paragraph({
          numbering: { reference: 'participantes', level: 0 },
          spacing: { before: 0, after: 0, line: 276 },
          children: [
            new TextRun({
              text: p,
              font: this.FONTE_CORPO,
              color: this.COR_TEXTO,
              size: 22,
            }),
          ],
        })
      ),
    ];
  }

  private secaoPauta(pauta: PautaDocx): Paragraph[] {
    const paragrafos: Paragraph[] = [
      // Título "Pauta:"
      new Paragraph({
        spacing: { before: 200, after: 0, line: 240 },
        keepNext: true,
        keepLines: true,
        children: [
          new TextRun({
            text: 'Pauta:',
            font: this.FONTE_TITULO,
            bold: true,
            color: this.COR_SECAO,
            size: 26,
          }),
        ],
      }),
    ];

    // Cada item + subitem opcional
    for (const item of pauta.itens) {
      // Item principal: "Título (Xmin);"
      paragrafos.push(
        new Paragraph({
          numbering: { reference: 'itens', level: 0 },
          spacing: { before: 0, after: 0, line: 276 },
          children: [
            new TextRun({
              text: `${item.titulo} `,
              font: this.FONTE_CORPO,
              color: this.COR_AUTO,
              size: 22,
            }),
            new TextRun({
              text: `(${item.duracao}min)`,
              font: this.FONTE_CORPO,
              italics: true,
              color: this.COR_AUTO,
              size: 22,
            }),
            new TextRun({
              text: ';',
              font: this.FONTE_CORPO,
              color: this.COR_AUTO,
              size: 22,
            }),
          ],
        })
      );

      // Subitem (indentado) — apenas se existir
      if (item.subitem?.trim()) {
        paragrafos.push(
          new Paragraph({
            numbering: { reference: 'itens', level: 0 },
            spacing: { before: 0, after: 0, line: 276 },
            indent: { left: 1080, hanging: 360 },
            children: [
              new TextRun({
                text: item.subitem,
                font: this.FONTE_CORPO,
                color: this.COR_AUTO,
                size: 22,
                underline: {},
              }),
            ],
          })
        );
      }
    }

    // Linha em branco após os itens
    paragrafos.push(new Paragraph({ spacing: { before: 0, after: 0, line: 276 }, children: [] }));

    return paragrafos;
  }

  private rodape(pauta: PautaDocx): Paragraph[] {
    return [
      // Tempo total
      new Paragraph({
        numbering: { reference: 'rodape', level: 0 },
        spacing: { before: 0, after: 200, line: 276 },
        children: [
          new TextRun({
            text: 'Tempo a ser gasto na reunião: ',
            font: this.FONTE_CORPO,
            color: this.COR_AUTO,
            size: 22,
          }),
          new TextRun({
            text: `${pauta.totalMinutos} min`,
            font: this.FONTE_CORPO,
            italics: true,
            color: this.COR_AUTO,
            size: 22,
          }),
          new TextRun({
            text: '.',
            font: this.FONTE_CORPO,
            color: this.COR_AUTO,
            size: 22,
          }),
        ],
      }),

      // Responsável
      new Paragraph({
        spacing: { before: 0, after: 200, line: 276 },
        children: [
          new TextRun({
            text: 'Responsável pela reunião: ',
            font: this.FONTE_CORPO,
            color: this.COR_AUTO,
            size: 22,
          }),
          new TextRun({
            text: pauta.responsaveis.join(', '),
            font: this.FONTE_CORPO,
            color: this.COR_TEXTO,
            size: 22,
          }),
        ],
      }),
    ];
  }
}
