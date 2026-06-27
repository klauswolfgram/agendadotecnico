import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from "@angular/router";
import { Toolbar } from '../../shared/toolbar/toolbar';
import { Footer } from '../../shared/footer/footer';
import { ToolbarService } from '../../core/services/toolbar-service';
import { ErpService } from '../../core/services/erp-service';
import { NetworkService } from '../../core/services/network-service';
import { AuthService } from '../../core/services/auth-service';
import { Subscription } from 'rxjs';
import { NotificacoesService } from '../../core/services/notificacoes-service';

@Component({
  selector: 'app-master',
  imports: [RouterModule,Toolbar,Footer],
  templateUrl: './master.html',
  styleUrl: './master.scss',
})
export class Master implements OnInit, OnDestroy {

  private toolbarService = inject(ToolbarService);
  private erpService = inject(ErpService);
  private networkService = inject(NetworkService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificacoesService);

  private sub = new Subscription();

  private isOnLine$ = this.networkService.onLine$;
  private isOnLine: boolean = true;

  private section = this.authService.current;
  
  constructor() {
    this.toolbarService.isLoggedOn.set(true);
    this.sub.add(this.isOnLine$.subscribe(status => this.isOnLine = status));
  }

  ngOnInit(): void {
    
    if(this.section.userid === 'demo'){
      this.erpService.loadAgendaMock();
      return;
    }

    if(this.isOnLine) {
      this.notificationService.loadFromAPI();
      this.erpService.loadAgenda();
      this.erpService.loadOcorrencias();
    }else{
      this.notificationService.loadFromStorage();
      this.erpService.loadAgendaFromStorage();
      this.erpService.loadOcorrenciasFromStorage();
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
