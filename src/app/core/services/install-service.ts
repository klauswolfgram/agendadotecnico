import { Injectable, signal } from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'demissed'}>;
}

@Injectable({
  providedIn: 'root',
})
export class InstallService {

  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  public canInstall = signal<boolean>(false);

  constructor() {
    window.addEventListener('beforeinstallprompt',(event: Event) => {
      event.preventDefault();

      this.deferredPrompt = event as BeforeInstallPromptEvent;
      this.canInstall.set(true);
    });
  }

  public install = async () => {

    if(!this.deferredPrompt) return;
    
    this.deferredPrompt.prompt();
    const choice = await this.deferredPrompt.userChoice;

    if(choice.outcome === 'accepted'){
      console.log('Instalação autorizada')
    }else{
      console.log('Instalação não autorizada')
    }

    this.deferredPrompt = null;
    this.canInstall.set(false);
  }
  
}
