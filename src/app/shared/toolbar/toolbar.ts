import { Component, HostListener, inject, signal } from '@angular/core';
import { ToolbarService } from '../../core/services/toolbar-service';
import { CommonModule } from '@angular/common';
import { NetworkService } from '../../core/services/network-service';
import { AuthService } from '../../core/services/auth-service';
import { environment } from '../../core/environments/environment';

@Component({
  selector: 'app-toolbar',
  imports: [CommonModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar {

  public toolbarService = inject(ToolbarService);
  public networkService = inject(NetworkService);
  public authService = inject(AuthService);
  public version = signal<string>(environment.versao);

  public showProfileMenu = signal<boolean>(false);

  public toggleProfileMenu = (event: MouseEvent) => {
    event.stopPropagation();
    this.showProfileMenu.update(v => !v);
  }

  @HostListener('document:click',['$event'])
  public onCloseMenu = (event: MouseEvent) => {
    if(this.showProfileMenu()) this.showProfileMenu.set(false);
  }

}
