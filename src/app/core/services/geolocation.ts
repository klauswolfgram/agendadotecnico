import { computed, inject, Injectable, signal } from '@angular/core';
import { Geolocation as Loc } from '@capacitor/geolocation';
import { PoNotificationService } from '@po-ui/ng-components';

@Injectable({
  providedIn: 'root',
})
export class Geolocation {

  private latitude = signal<number | null>(null);
  private longitude = signal<number | null>(null);
  
  public endereco = signal<string>('');
  public coordenadas = computed(() => {
    
    const lat = this.latitude();
    const lon = this.longitude();

    if(lat !== null && lon !== null) return `${lat},${lon}`;

    return '';
  })

  private notify = inject(PoNotificationService);

  constructor() {}

  public carregarLocalizacaoAtual = async () => {

    try {

      const permission = await Loc.requestPermissions();

      if (permission.location === 'granted') {

        const position = await Loc.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });

        this.latitude.set(position.coords.latitude);
        this.longitude.set(position.coords.longitude);

        await this.carregarEndereco();

      } else {
        await this.carregarLocalizacaoBrowse();
        return;
      }

    } catch (e) {
      await this.carregarLocalizacaoBrowse();
    }

  };

  private carregarLocalizacaoBrowse = async () => {
    
    if(!navigator.geolocation){
      this.notify.warning({duration: 2000, message: 'Localização não disponível!'});
      return;
    }

    return new Promise<void>(res => {
      
      navigator.geolocation.getCurrentPosition(async position => {
        
        this.latitude.set(position.coords.latitude);
        this.longitude.set(position.coords.longitude);

        await this.carregarEndereco();

        res();
      },() => {
        this.notify.warning({duration: 2000, message: 'Localização não disponível!'});
        res();
      },{
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      })
    })
  };

  private carregarEndereco = async () => {
    
    const lat = this.latitude();
    const lon = this.longitude();

    if(lat === null || lon === null){
      this.endereco.set('Endereço não localizado!');
      return;
    }

    try {
      
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await resp.json();
      
      const endereco = data?.display_name ?? 'Endereço não localizado!'
      
      this.endereco.set(endereco);

    } catch(e) {
      this.endereco.set('Endereço não localizado!');
    }

  }  

}