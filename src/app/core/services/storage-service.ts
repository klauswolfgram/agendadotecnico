import { inject, Injectable } from '@angular/core';
import localForage from 'localforage'
import { environment } from '../environments/environment';
import { PoNotificationService } from '@po-ui/ng-components';

//-- https://localforage.github.io/localForage/

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  private instance: LocalForage;
  private notify = inject(PoNotificationService);

  constructor() {
    this.instance = localForage.createInstance({
      name: environment.STORAGE_NAME,storeName: environment.STORAGE_STORENAME
    })
  }

  set = async <T>(key: string, value: T): Promise<void> => {
    await this.instance.setItem(key,value);
  } 

  async get<T>(key: string): Promise<T | null> {
    return await this.instance.getItem<T>(key);
  }

  async remove(key: string): Promise<void> {
    try {
      await this.instance.removeItem(key);
    } catch (e) {
      console.log('erro ao remover o registro',e);
      this.notify.error('erro ao remover o registro');
    }
  }

  clear = async (): Promise<void> => {
    try {
      await this.instance.clear();
    }catch (e) {
      console.log('erro na limpeza do banco',e);
      this.notify.error('erro na limpeza do banco');
    }
  }

  async keys(prefixo: string): Promise<Array<string>> {
    const keys = await this.instance.keys();
    return prefixo ? keys.filter(key => key.startsWith(prefixo)) : keys
  }

}
