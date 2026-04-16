import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToolbarService {
  
  public title = signal<string>('Agenda do Técnico');
  public isShowBtnBack = signal<Boolean>(false);
  public isShowBtnInstall = signal<Boolean>(true);
  public isWifiOn = signal<Boolean>(true);
  public isLoggedOn = signal<Boolean>(true);

  public desenvolvedor = signal<string>('KLAUS WOLFGRAM');

}
