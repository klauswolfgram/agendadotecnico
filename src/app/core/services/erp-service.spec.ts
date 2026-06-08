import { Agenda } from '../models/agenda';
import { mergeAgendaSyncState } from './erp-service';

describe('mergeAgendaSyncState', () => {
  it('keeps ERP attendances synced when refreshing agenda', () => {
    const current = new Agenda();
    current.data = [
      {
        filial: '01',
        id: '33',
        os: '120620/01',
        cliente: '',
        dadoscliente: {
          codigo: '',
          cgc: '',
          nome: '',
          cep: '',
          endereco: '',
          bairro: '',
          cidade: '',
          estado: '',
          telefone: '',
          email: '',
        },
        equipamento: '',
        data: '',
        ocorrencia: '',
        situacao: '',
        status: '',
        statusType: '',
        texto_ocorrencia: '',
        id_assinatura: '',
        atendimentos: [{ id: '9', id_os: '33', os: '12062001', tecnico: '', sequencia: '', ocorrencia: '', chegada: '', inicio: '', fim: '', traslado: '', situacao: '', texto: '', coordenadas: '', endereco: '', id_assinatura: '', sync: true }],
      },
    ];

    const refreshed = structuredClone(current);
    delete (refreshed.data[0].atendimentos[0] as Partial<{ sync: boolean }>).sync;

    const merged = mergeAgendaSyncState(refreshed, current);

    expect(merged.data[0].atendimentos[0].sync).toBe(true);
  });
});
