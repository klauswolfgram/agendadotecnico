import { inject, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {

  private onLineApp = new BehaviorSubject<boolean>(navigator.onLine);
  private zone = inject(NgZone);

  public onLine$ = this.onLineApp.asObservable();

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring = () => {
    window.addEventListener('online' , () => this.zone.run(() => this.onLineApp.next(true )));
    window.addEventListener('offline', () => this.zone.run(() => this.onLineApp.next(false)));
  }

  public isOnline = (): boolean => this.onLineApp.value; 

  public checkInternet = async () => {
    
    if(!navigator.onLine){
      return false;
    }

    try {
      const response = await fetch('https://www.google.com/generate_204',{method: 'HEAD', cache: 'no-cache'});
      return response.ok;
    } catch (e) {
      return false;
    }
  }
  
}
