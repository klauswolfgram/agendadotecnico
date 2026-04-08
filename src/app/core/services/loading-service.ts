import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  public isHidden = signal<boolean>(true);
  public texto = signal<string>('Aguarde');
}
