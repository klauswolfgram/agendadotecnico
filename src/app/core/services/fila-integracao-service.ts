import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { StorageService } from './storage-service';
import { NetworkService } from './network-service';
import { environment } from '../environments/environment';
import { firstValueFrom } from 'rxjs';
import { PoNotificationService } from '@po-ui/ng-components';

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

  }

  private processarGaleria = async () => {

  }

  private processarAssinaturas = async () => {

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
