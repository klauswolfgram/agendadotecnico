import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { StorageService } from './storage-service';
import { LoadingService } from './loading-service';
import { PoNotificationService } from '@po-ui/ng-components';
import { BehaviorSubject, Observable, Subscription, tap } from 'rxjs';
import { Agenda, Atendimento } from '../models/agenda';
import { environment } from '../environments/environment';
import { Linha, Tabela } from '../models/tabela';
import { Assinatura } from '../models/assinatura';
import { FilaIntegracaoService } from './fila-integracao-service';

@Injectable({
  providedIn: 'root',
})
export class ErpService implements OnDestroy {

  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private loading = inject(LoadingService);
  private notify = inject(PoNotificationService);
  private filaIntegracao = inject(FilaIntegracaoService);
  private sub = new Subscription();

  private agenda = new BehaviorSubject<Agenda>(new Agenda());
  public ocorrencias = signal<Array<Linha>>([]);

  constructor() { }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public loadOcorrencias = () => {
    this.http.get<Tabela>(`${environment.url_base}custom/app/agenda/tabelas/ocorrencias`)
    .pipe(tap({
      subscribe: () => this.loading.isHidden.set(false),
      next: async (ocorrencias) => await this.storage.set<Tabela>(environment.STORAGE_KEY_OCORRENCIAS,ocorrencias),
      error: (e) => this.notify.warning({duration: 2000, message: e.error.message}),
      finalize: () => this.loading.isHidden.set(true)
    }))
    .subscribe({
      next: (ocorrencias) => this.ocorrencias.set(ocorrencias.data)
    })
  }

  public loadOcorrenciasFromStorage = async () => {
    
    this.loading.isHidden.set(false);
    
    const ocorrencias: Tabela = await this.storage.get<Tabela>(environment.STORAGE_KEY_OCORRENCIAS) ?? new Tabela;
    
    this.ocorrencias.set(ocorrencias.data);
    this.loading.isHidden.set(true);
    
  }

  public getAgenda = (): Observable<Agenda> => this.agenda.asObservable();

  public loadAgenda = () => {
    this.http.get<Agenda>(`${environment.url_base}custom/app/agenda/agendamentos`)
      .pipe(tap({
        subscribe: () => this.loading.isHidden.set(false),
        next: async (agenda) => {
          await this.filaIntegracao.processarFilaIntegracao();
          await this.storage.set<Agenda>(environment.STORAGE_KEY_AGENDA, agenda);
        },
        error: (e) => this.notify.error(e?.error?.message || 'Erro ao carregar agenda'),
        finalize: () => this.loading.isHidden.set(true)
      }))
      .subscribe({
        next: (agenda) => this.agenda.next(agenda)
      });
  }

  public loadAgendaFromStorage = async () => {

    this.loading.isHidden.set(false);

    await this.filaIntegracao.processarFilaIntegracao();
    const agenda: Agenda = await this.storage.get<Agenda>(environment.STORAGE_KEY_AGENDA) ?? new Agenda();

    this.agenda.next(agenda);
    this.loading.isHidden.set(true);

  }

  public loadAgendaMock = () => {
    const dados = '{"status":"success","message":"","data":[{"filial":"01","id":"33","os":"120620/01","cliente":"EMEPOLO","equipamento":"PRODUTO ACABADO 1","data":"19/05/2025","ocorrencia":"PROBLEMA UTILIZACAO","situacao":"pendente","status":"Em atendimento","statusType":"warning","texto_ocorrencia":"","dadoscliente":{"codigo":"00000301","cgc":"              ","cep":"09010010","nome":"INDUSTRIA EMEPOLO /SP","endereco":"R DR ALBUQUERQUE LINS, 465","bairro":"BELA VISTA","cidade":"SANTO ANDRE","estado":"SP","telefone":"32421587","email":""},"atendimentos":[{"id":9,"id_os":33,"os":"12062001","tecnico":"BRUNO HENRIQUE","sequencia":"01","ocorrencia":"EQUIPAMENTO QUEBRADO","chegada":"09/05/2026 09:00","inicio":"09/05/2026 09:00","fim":"09/05/2026 12:00","traslado":"01:00","situacao":"Em Aberto","texto":"FOI FEITO O REPARO"},{"id":11,"id_os":33,"os":"12062001","tecnico":"BRUNO HENRIQUE","sequencia":"02","ocorrencia":"ATIVAR EQUIPAMENTO SUBSTITUIDO","chegada":"09/05/2026 13:00","inicio":"09/05/2026 13:00","fim":"09/05/2026 18:00","traslado":"01:00","situacao":"Em Aberto","texto":"ATIVAÇÃO DO EQUIPAMENTO REPARADO."}]},{"filial":"01","id":"29","os":"120616/01","cliente":"FF LTDA","equipamento":"PRODUTO ACABADO 1","data":"03/11/2008","ocorrencia":"DEFEITO NA FUNCAO TELFOM","situacao":"pendente","status":"Atendida","statusType":"success","texto_ocorrencia":"","dadoscliente":{"codigo":"00000401","cgc":"              ","cep":"01226010","nome":"FARTURAS FORTUNAS LTDA /SP","endereco":"R DAS PALMEIRAS, 456","bairro":"CONSOLACAO","cidade":"SAO PAULO","estado":"SP","telefone":"32155654","email":""},"atendimentos":[{"id":6,"id_os":29,"os":"12061601","tecnico":"","sequencia":"01","ocorrencia":"DEFEITO NA FUNCAO TELFOM","chegada":"03/11/2008 09:00","inicio":"03/11/2008 09:00","fim":"03/11/2008 12:00","traslado":"     ","situacao":"Encerrado","texto":""}]},{"filial":"01","id":"23","os":"120610/01","cliente":"CLIENTE PADRAO","equipamento":"PRODUTO ACABADO 1","data":"12/08/2008","ocorrencia":"PROBLEMA TECNICO","situacao":"encerrado","status":"Pedido Gerado","statusType":"warning","texto_ocorrencia":"","dadoscliente":{"codigo":"00000101","cgc":"              ","cep":"12356452","nome":"CLIENTE PADRAO","endereco":"R ESTRELA DALVA, 5482","bairro":"EUGENIO DE MELLO (SAO JOSE DOS","cidade":"SAO PAULO","estado":"SP","telefone":"50514050","email":"administrador@microsiga.com"},"atendimentos":[{"id":7,"id_os":23,"os":"12061001","tecnico":"","sequencia":"01","ocorrencia":"PROBLEMA TECNICO","chegada":"03/11/2008 09:00","inicio":"03/11/2008 09:00","fim":"03/11/2008 16:00","traslado":"     ","situacao":"Encerrado","texto":""}]},{"filial":"01","id":"22","os":"120609/01","cliente":"EMEPOLO","equipamento":"PRODUTO ACABADO 1","data":"12/08/2008","ocorrencia":"CAIXA AMASSADA","situacao":"pendente","status":"Atendida","statusType":"success","texto_ocorrencia":"","dadoscliente":{"codigo":"00000301","cgc":"              ","cep":"09010010","nome":"INDUSTRIA EMEPOLO /SP","endereco":"R DR ALBUQUERQUE LINS, 465","bairro":"BELA VISTA","cidade":"SANTO ANDRE","estado":"SP","telefone":"32421587","email":""},"atendimentos":[{"id":5,"id_os":22,"os":"12060901","tecnico":"","sequencia":"01","ocorrencia":"CAIXA AMASSADA","chegada":"12/08/2008 09:00","inicio":"12/08/2008 09:00","fim":"12/08/2008 17:00","traslado":"01:00","situacao":"Encerrado","texto":""}]},{"filial":"01","id":"17","os":"050606/01","cliente":"CLIENTE PADRAO","equipamento":"PRODUTO ACABADO 1","data":"05/06/2006","ocorrencia":"PROBLEMA TECNICO","situacao":"pendente","status":"Atendida","statusType":"success","texto_ocorrencia":"","dadoscliente":{"codigo":"00000101","cgc":"              ","cep":"12356452","nome":"CLIENTE PADRAO","endereco":"R ESTRELA DALVA, 5482","bairro":"EUGENIO DE MELLO (SAO JOSE DOS","cidade":"SAO PAULO","estado":"SP","telefone":"50514050","email":"administrador@microsiga.com"},"atendimentos":[{"id":4,"id_os":17,"os":"05060601","tecnico":"","sequencia":"01","ocorrencia":"PROBLEMA TECNICO","chegada":"05/06/2006 10:00","inicio":"05/06/2006 10:00","fim":"05/06/2006 11:15","traslado":"01:00","situacao":"Encerrado","texto":""}]},{"filial":"01","id":"13","os":"000012/01","cliente":"CLIENTE PADRAO","equipamento":"PRODUTO ACABADO 1","data":"29/05/2006","ocorrencia":"PROBLEMA UTILIZACAO","situacao":"pendente","status":"Atendida","statusType":"success","texto_ocorrencia":"","dadoscliente":{"codigo":"00000101","cgc":"              ","cep":"12356452","nome":"CLIENTE PADRAO","endereco":"R ESTRELA DALVA, 5482","bairro":"EUGENIO DE MELLO (SAO JOSE DOS","cidade":"SAO PAULO","estado":"SP","telefone":"50514050","email":"administrador@microsiga.com"},"atendimentos":[{"id":8,"id_os":13,"os":"00001201","tecnico":"","sequencia":"01","ocorrencia":"PROBLEMA UTILIZACAO","chegada":"16/04/2009 09:00","inicio":"16/04/2009 09:00","fim":"16/04/2009 10:00","traslado":"01:00","situacao":"Encerrado","texto":""}]},{"filial":"01","id":"6","os":"000004/01","cliente":"ECOSSISTEMA","equipamento":"PRODUTO ACABADO 1","data":"12/07/2005","ocorrencia":"MONTAGEM DE AMBIENTE","situacao":"encerrado","status":"Pedido Gerado","statusType":"warning","texto_ocorrencia":"","dadoscliente":{"codigo":"00000201","cgc":"00000000000000","cep":"02611015","nome":"ECOSSISTEMA DIGITAL S/A","endereco":"R ISABEL DE SIQUEIRA BARROS, 455","bairro":"SANTANA","cidade":"SAO PAULO","estado":"SP","telefone":"32410123","email":""},"atendimentos":[]},{"filial":"01","id":"5","os":"000003/01","cliente":"ECOSSISTEMA","equipamento":"PRODUTO ACABADO 1","data":"12/07/2005","ocorrencia":"LEVANTAMENTO DE DADOS","situacao":"pendente","status":"Atendida","statusType":"success","texto_ocorrencia":"","dadoscliente":{"codigo":"00000201","cgc":"00000000000000","cep":"02611015","nome":"ECOSSISTEMA DIGITAL S/A","endereco":"R ISABEL DE SIQUEIRA BARROS, 455","bairro":"SANTANA","cidade":"SAO PAULO","estado":"SP","telefone":"32410123","email":""},"atendimentos":[{"id":3,"id_os":5,"os":"00000301","tecnico":"","sequencia":"01","ocorrencia":"LEVANTAMENTO DE DADOS","chegada":"29/05/2006 08:00","inicio":"29/05/2006 08:00","fim":"29/05/2006 10:00","traslado":"     ","situacao":"Encerrado","texto":""}]},{"filial":"01","id":"4","os":"000002/01","cliente":"ECOSSISTEMA","equipamento":"PRODUTO ACABADO 1","data":"12/07/2005","ocorrencia":"MONTAGEM DE AMBIENTE","situacao":"pendente","status":"Pedido Gerado","statusType":"warning","texto_ocorrencia":"","dadoscliente":{"codigo":"00000201","cgc":"00000000000000","cep":"02611015","nome":"ECOSSISTEMA DIGITAL S/A","endereco":"R ISABEL DE SIQUEIRA BARROS, 455","bairro":"SANTANA","cidade":"SAO PAULO","estado":"SP","telefone":"32410123","email":""},"atendimentos":[{"id":2,"id_os":4,"os":"00000201","tecnico":"","sequencia":"01","ocorrencia":"MONTAGEM DE AMBIENTE","chegada":"12/07/2005 09:00","inicio":"12/07/2005 09:00","fim":"12/07/2005 11:00","traslado":"01:00","situacao":"Encerrado","texto":""}]},{"filial":"01","id":"1","os":"000001/01","cliente":"ECOSSISTEMA","equipamento":"PRODUTO ACABADO 1","data":"12/07/2005","ocorrencia":"PROBLEMA TECNICO","situacao":"encerrado","status":"Pedido Gerado","statusType":"warning","texto_ocorrencia":"","dadoscliente":{"codigo":"00000201","cgc":"00000000000000","cep":"02611015","nome":"ECOSSISTEMA DIGITAL S/A","endereco":"R ISABEL DE SIQUEIRA BARROS, 455","bairro":"SANTANA","cidade":"SAO PAULO","estado":"SP","telefone":"32410123","email":""},"atendimentos":[{"id":1,"id_os":1,"os":"00000101","tecnico":"","sequencia":"01","ocorrencia":"EQUIPAMENTO QUEBRADO","chegada":"09/03/2005 09:00","inicio":"09/03/2005 09:00","fim":"09/03/2005 12:00","traslado":"01:00","situacao":"Encerrado","texto":""}]}]}';    const agenda: Agenda = JSON.parse(dados)
    this.agenda.next(agenda);
  }

  public setNovoAtendimento = async (novoAtendimento: Atendimento) => {
    try {
      const agenda = structuredClone(this.agenda.value);
      const index = agenda.data.findIndex(e => e.id === novoAtendimento.id_os);
      if(index >= 0){
        agenda.data[index].atendimentos.push({...novoAtendimento});
        this.agenda.next(agenda);
        
        await this.storage.set<Agenda>(environment.STORAGE_KEY_AGENDA,agenda);
        await this.filaIntegracao.processarFilaIntegracao();
        
        this.notify.success({duration: 2000, message: 'Novo atendimento incluido'});
      }
    } catch (e) {
      console.log(e);
      this.notify.warning({duration: 2000, message: "Erro ao salvar atendimento. Veja o log."})
    }
  }

  public setAssinaturaAgendamento = async (id: string, id_assinatura: string) => {
    
    const agenda = structuredClone(this.agenda.value);
    const index = agenda.data.findIndex(item => String(item.id) === id);

    if(index < 0) return ;

    agenda.data[index].id_assinatura = id_assinatura;
    
    this.agenda.next(agenda);
    
    await this.storage.set<Agenda>(environment.STORAGE_KEY_AGENDA,agenda);
    await this.filaIntegracao.processarFilaIntegracao();

  }

  public setAssinaturaAtendimento = async (id: string, id_atendimento: string, id_assinatura: string) => {
    
    const agenda = structuredClone(this.agenda.value);
    const index = agenda.data.findIndex(item => String(item.id) === id);

    if(index < 0) return ;  
    
    const index_atendimento = agenda.data[index].atendimentos.findIndex(item => String(item.id) === id_atendimento);

    if(index_atendimento < 0) return;

    agenda.data[index].atendimentos[index_atendimento].id_assinatura = id_assinatura;
    
    this.agenda.next(agenda);
    
    await this.storage.set<Agenda>(environment.STORAGE_KEY_AGENDA,agenda);
    await this.filaIntegracao.processarFilaIntegracao();
    
  }

}
