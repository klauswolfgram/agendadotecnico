import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Section } from '../models/section';
import { StorageService } from './storage-service';
import { LoadingService } from './loading-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private urlAuth: string = `${environment.url_base}api/oauth2/v1/token`;
  private http = inject(HttpClient);
  private storageService = inject(StorageService);
  private loadingService = inject(LoadingService);
  private section = new BehaviorSubject<Section>(new Section);

  constructor() {

  }

  public setSection = (section: Section) => this.section.next(section);
  public getSection = (): Observable <Section> => this.section.asObservable();

  public createSection = (username: string, password: string): Observable<Section> => {
    
    const url: string = `${this.urlAuth}?grant_type=password&username=${username}&password=${password}`;
    this.loadingService.isHidden.set(false);
    
    return this.http.post<Section>(url,null).pipe(tap({
      next: async (section) => {
        try {
          const now: number = Date.now();
          const newSection: Section = {
            ...section,
            expires_token: now + (section.expires_in * 1000), 
            expires_refresh_token: now + (section.expires_in * 1000 * 24)};
          this.section.next(newSection);
          await this.storageService.set<Section>(environment.STORAGE_KEY_SECTION,newSection);
        } catch (e) {
          console.log('erro de gravacao',e)
        }
      },
      error: (err) => { console.log('erro',err)},
      finalize: () => this.loadingService.isHidden.set(true)
    }));
  }
  
}
