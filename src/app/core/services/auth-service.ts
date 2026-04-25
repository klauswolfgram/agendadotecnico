import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, finalize, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { RespTecnico, Section, Tecnico} from '../models/section';
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

  get current(): Section {
    return this.section.value;
  }

  public setSection = (section: Section) => this.section.next(section);
  public getSection = (): Observable<Section> => this.section.asObservable();

  public createSection = (username: string, password: string): Observable<Section> => {

    if(username.trim().toLowerCase() === 'demo') {
      let section: Section = new Section();
      section.expires_in = 999999;
      section.expires_token = Date.now() + (section.expires_in * 1000);
      section.expires_refresh_token = Date.now() + (section.expires_in * 1000 * 24);
      section.username = 'demonstracao';
      section.userid = 'demo';
      section.tecnico.nome = 'Demonstração';

      this.section.next(section);
      return of(section);
    }

    const url: string = `${this.urlAuth}?grant_type=password&username=${username}&password=${password}`;

    return this.http.post<Section>(url,null).pipe(
      tap({
        subscribe: () => this.loadingService.isHidden.set(false),
        next: (section) => {
          const now: number = Date.now();
          const newSection: Section = {...section, expires_token: now + (section.expires_in * 1000), expires_refresh_token: now + (section.expires_in * 1000 * 24)};
          this.section.next(newSection);
        },
      }),
      switchMap((_) => {
        const url: string = `${environment.url_base}api/framework/v1/users?username=${username}`;
        return this.http.get<any>(url);
      }),
      tap(RetUser => {
        const userid: string = RetUser.items[0].id;
        const newSection: Section = {...this.section.value, userid};
        this.section.next(newSection);
      }),
      switchMap((_) => {
        const url: string = `${environment.url_base}custom/app/agenda/profile?userid=${this.section.value.userid}`;
        return this.http.get<RespTecnico>(url);
      }),
      tap(value => {
        if(value.status === 'success') {
          const tecnico: Tecnico = value.data;
          const newSection: Section = {...this.section.value,tecnico};
          this.section.next(newSection);
        }
      }),
      switchMap((_) => {
        return from(this.storageService.set<Section>(environment.STORAGE_KEY_SECTION,this.section.value))
        .pipe(map(() => this.section.value));
      }),
      finalize(() => this.loadingService.isHidden.set(true))
    );

    /*/
    return this.http.post<Section>(url,null).pipe(tap({
      subscribe: () => this.loadingService.isHidden.set(false),
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
    /*/
  }

  public refreshSection = (): Observable<Section> => {

    const url: string = `${this.urlAuth}?grant_type=refresh_token&refresh_token=${this.section.value.refresh_token}`;
    return this.http.post<Section>(url, null).pipe(tap({
      next: section => {
        const now: number = Date.now();
        
        let newSection: Section = {...this.section.value};
        newSection.access_token = section.access_token;
        newSection.expires_in = section.expires_in;
        newSection.refresh_token = section.refresh_token;
        newSection.expires_token = now + (section.expires_in * 1000);
        newSection.expires_refresh_token = now + (section.expires_in * 1000 * 24);
        
        this.section.next(newSection);
        this.storageService.set<Section>(environment.STORAGE_KEY_SECTION, newSection).then().catch(e => console.log('erro refresh', e));
      }
    }))
  }

}
