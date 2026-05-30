import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Assinatura } from '../models/assinatura';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AssinaturaService {

  private storage = inject(StorageService);
  private assinaturas = new BehaviorSubject<Assinatura[]>([]);

  public origem = signal<string>('Assinatura');
  public getAssinaturas = (): Observable<Assinatura[]> => this.assinaturas.asObservable();

  public loadFromStorage = async () => {
    const assinaturas = await this.storage.get<Assinatura[]>(environment.STORAGE_KEY_ASSINATURAS) || [];
    this.assinaturas.next(assinaturas);
  }

  public getById = async (id: string | null | undefined): Promise<Assinatura | null> => {
    
    if(!id) return null;

    const assinaturas = await this.storage.get<Assinatura[]>(environment.STORAGE_KEY_ASSINATURAS) || [];
    const assinatura = assinaturas.find(item => item.id === id && !item.delete);
    return assinatura || null;

  }

  public salvar = async (arq64: string, id?: string | null): Promise<Assinatura> => {

    const assinaturas = await this.storage.get<Assinatura[]>(environment.STORAGE_KEY_ASSINATURAS) || [];
    const index = assinaturas.findIndex(item => item.id === id);
    const agora = new Date().toISOString();

    if(index >= 0) {
      assinaturas[index] = {
        ...assinaturas[index],
        arq64,
        data_atualizacao: agora,
        sync: false,
        delete: false,
        sync_delete: false,
      };
    }else{
      assinaturas.push({
        id: Date.now().toString(),
        arq64,
        data_criacao: agora,
        data_atualizacao: agora,
        sync: false,
        delete: false,
        sync_delete: false
      });
    }

    await this.storage.set<Assinatura[]>(environment.STORAGE_KEY_ASSINATURAS,assinaturas);
    this.assinaturas.next(assinaturas);

    return index >= 0 ? assinaturas[index] : assinaturas[assinaturas.length -1];
  };

  public apagar = async (assinatura: Assinatura): Promise<void> => {
    
    const assinaturas = await this.storage.get<Assinatura[]>(environment.STORAGE_KEY_ASSINATURAS) || [];
    const index = assinaturas.findIndex(item => item.id === assinatura.id);

    if(index >= 0) {
      assinaturas[index] = {
        ...assinaturas[index],
        arq64: '',
        delete: true,
        sync_delete: false,
        data_atualizacao: new Date().toISOString()
      };
    }

    await this.storage.set<Assinatura[]>(environment.STORAGE_KEY_ASSINATURAS,assinaturas);
    this.assinaturas.next(assinaturas);    
  } 
  
}
