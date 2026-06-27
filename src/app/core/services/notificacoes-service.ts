import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage-service';
import { PoNotificationService } from '@po-ui/ng-components';
import { AuthService } from './auth-service';
import { environment } from '../environments/environment';
import { Notificacao, RetAcaoNotificacao, RetNotificacoes } from '../models/notificacao';

@Injectable({
  providedIn: 'root',
})
export class NotificacoesService {

  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private notify = inject(PoNotificationService);
  private auth = inject(AuthService);
  private url = `${environment.url_base}custom/app/agenda/notificacoes`;
  private lista = signal<Notificacao[]>([]);

  public notificacoes = this.lista.asReadonly();
  public quantidade = computed(() => this.lista().length);

  public loadFromStorage = async (): Promise<void> => {
    
    const response = await this.storage.get<RetNotificacoes>(environment.STORAGE_KEY_NOTIFICACOES);
    const notificacoes = response?.notificacoes ?? [];

    this.lista.set(notificacoes);

  }

  public loadFromAPI = () => {
    
    const tecnico = this.auth.current.tecnico.codtec;
    
    if(!tecnico) {
      this.loadFromStorage();
      return;
    }

    this.http.get<RetNotificacoes>(this.url, {params: {tecnico}}).subscribe({
      next: resp => {
        if(resp.status !== 'success') {
          this.notify.warning({duration: 2000, message: resp.message})
          return;
        }

        const notificacoes = resp.notificacoes ?? [];
        this.updateLocal(notificacoes);
      },
      error: err => this.notify.warning({duration: 2000, message: err.error.message || 'Erro ao obter notificacoes'})
    })
  }

  public markAsRead = (item: Notificacao) => {
    this.http.put<RetAcaoNotificacao>(`${this.url}/${item.id}`,null).subscribe({
      next: resp => this.updateLocal(this.lista().filter(notify => notify.id !== item.id)),
      error: err => this.notify.warning({duration: 2000, message: err.error.message})
    })
  };

  public markAllAsRead = () => {
    const tecnico = this.auth.current.tecnico.codtec;

    this.http.put<RetAcaoNotificacao>(`${this.url}/markallasread`,null,{params: {tecnico}}).subscribe({
      next: resp => {
        this.updateLocal([]);
        this.notify.success({duration: 2000, message: 'Notificações atualizadas'})
      },
      error: err => this.notify.warning({duration: 2000, message: err.error.message || 'Error ao marcar notificações como lida.'})
    })
  }

  private updateLocal = (notificacoes: Notificacao[]) => {
    
    this.lista.set(notificacoes);

    const response : RetNotificacoes = {
      status: 'success',
      message: '',
      notificacoes
    }

    this.storage.set<RetNotificacoes>(environment.STORAGE_KEY_NOTIFICACOES,response)
    .catch(() => this.notify.warning({duration: 2000, message: 'Erro ao armazenar notificacoes'}));
  }
  
}
