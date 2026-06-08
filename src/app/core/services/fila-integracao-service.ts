import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { StorageService } from './storage-service';
import { NetworkService } from './network-service';
import { environment } from '../environments/environment';
import { firstValueFrom } from 'rxjs';
import { PoNotificationService } from '@po-ui/ng-components';
import { Agenda } from '../models/agenda';
import { Foto } from '../models/foto';
import { Assinatura } from '../models/assinatura';

interface RetornoFilaIntegracao {
  status: 'success' | 'error';
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class FilaIntegracaoService {
  
  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private network = inject(NetworkService);
  private notify = inject(PoNotificationService);

  private endpoint = `${environment.url_base}custom/app/agenda/fila-integracao`;

  public processarFilaIntegracao = async () => {

    if(!this.network.isOnline()) return;

    await this.processarAtendimentos();
    await this.processarAssinaturas();
    await this.processarGaleria();

  } 

  private processarAtendimentos = async () => {

    let alterou = false;

    const agenda = await this.storage.get<Agenda>(environment.STORAGE_KEY_AGENDA) ?? new Agenda();
    const pendentes = agenda.data.flatMap(agendamento => agendamento.atendimentos.filter(atendimento => atendimento.sync === false));
    
    for (const atendimento of pendentes) {
      
      const sucesso = await this.enviarParaFila('ATENDIMENTO',atendimento);
      
      if(!sucesso) continue;
      atendimento.sync = true;
      alterou = true;

     }

     if(alterou) await this.storage.set<Agenda>(environment.STORAGE_KEY_AGENDA,agenda);

  }

  private processarGaleria = async () => {

    let alterou = false;
    
    const fotos = await this.storage.get<Foto[]>(environment.STORAGE_KEY_GALERIA) ?? [];
    const pendentes = fotos.filter(foto => !foto.sync || (foto.delete && !foto.sync_delete));

    for (const foto of pendentes) {
      
      const sucesso = await this.enviarParaFila('GALERIA',foto);
      
      if(!sucesso) continue;
      
      foto.sync = true;
      foto.delete = foto.delete ? true : foto.sync_delete;
      alterou = true

    }

    if(alterou) await this.storage.set<Foto[]>(environment.STORAGE_KEY_GALERIA,fotos);

  }

  private processarAssinaturas = async () => {

    let alterou = false;

    const assinaturas = await this.storage.get<Assinatura[]>(environment.STORAGE_KEY_ASSINATURAS) ?? [];
    const pendentes = assinaturas.filter(assinatura => !assinatura.sync || (assinatura.delete && !assinatura.sync_delete));

    for (const assinatura of pendentes) {
      
      const sucesso = await this.enviarParaFila('ASSINATURA',assinatura);
      if(!sucesso) continue;

      assinatura.sync = true;
      assinatura.sync_delete = assinatura.delete ? true : assinatura.sync_delete;
      alterou = true;

    }

    if(alterou) await this.storage.set<Assinatura[]>(environment.STORAGE_KEY_ASSINATURAS,assinaturas);
  }

  private enviarParaFila = async <T>(origem: string, dados: T): Promise<boolean> => {

    try {
      const retorno = await firstValueFrom(this.http.post<RetornoFilaIntegracao>(this.endpoint, dados, {headers: {origem}}));
      if(retorno.status === 'error') this.notify.error(retorno.message);
      return retorno.status === 'success';
    } catch (e) {
      return false;
    }
  }
}
