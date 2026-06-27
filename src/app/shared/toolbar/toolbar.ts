import { Component, HostListener, inject, signal } from '@angular/core';
import { ToolbarService } from '../../core/services/toolbar-service';
import { CommonModule } from '@angular/common';
import { NetworkService } from '../../core/services/network-service';
import { AuthService } from '../../core/services/auth-service';
import { environment } from '../../core/environments/environment';
import { InstallService } from '../../core/services/install-service';
import { Router } from '@angular/router';
import { NotificacoesService } from '../../core/services/notificacoes-service';

@Component({
  selector: 'app-toolbar',
  imports: [CommonModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar {

  private router = inject(Router);

  public installService = inject(InstallService);
  public toolbarService = inject(ToolbarService);
  public networkService = inject(NetworkService);
  public authService = inject(AuthService);
  public version = signal<string>(environment.versao);
  public notificacoesService = inject(NotificacoesService);

  public showProfileMenu = signal<boolean>(false);

  public toggleProfileMenu = (event: MouseEvent) => {
    event.stopPropagation();
    this.showProfileMenu.update(v => !v);
  }

  @HostListener('document:click',['$event'])
  public onCloseMenu = (event: MouseEvent) => {
    if(this.showProfileMenu()) this.showProfileMenu.set(false);
  }

  public onClickBack = () => window.history.back();

  public onClickNotications = () => this.router.navigate(['/notificacoes']);

}
