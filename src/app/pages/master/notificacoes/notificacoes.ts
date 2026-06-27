import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NotificacoesService } from '../../../core/services/notificacoes-service';
import { ToolbarService } from '../../../core/services/toolbar-service';
import { Notificacao } from '../../../core/models/notificacao';

@Component({
  selector: 'app-notificacoes',
  imports: [],
  templateUrl: './notificacoes.html',
  styleUrl: './notificacoes.scss',
})
export class Notificacoes {

  private router = inject(Router);
  private notifyService = inject(NotificacoesService);
  private toolbar = inject(ToolbarService);

  public notificacoes = this.notifyService.notificacoes;

  constructor() {
    this.toolbar.isShowBtnBack.set(true);
    this.toolbar.title.set('Notificações');
  }

  public openLink = (link: string) => {
    if(!link) return;
    this.router.navigateByUrl(link.startsWith('/') ? link : `/${link}`);
  } 

  public markAsRead = (item: Notificacao) => this.notifyService.markAsRead(item);
  public markAllAsRead = () => this.notifyService.markAllAsRead();
  
}
