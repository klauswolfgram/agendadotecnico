import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { StorageService } from './storage-service';
import { NetworkService } from './network-service';
import { LoadingService } from './loading-service';
import { PoNotificationService } from '@po-ui/ng-components';
import { AuthService } from './auth-service';
import { BehaviorSubject, from, map, Observable, Subscription, tap } from 'rxjs';
import { Section } from '../models/section';
import { Agenda } from '../models/agenda';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ErpService implements OnDestroy {

  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private network = inject(NetworkService);
  private loading = inject(LoadingService);
  private notify = inject(PoNotificationService);
  private authService = inject(AuthService);
  private sub = new Subscription();

  private section = new Section();
  private agenda = new BehaviorSubject<Agenda>(new Agenda);

  constructor() { }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public getAgenda = (): Observable<Agenda> => {
    return this.agenda.asObservable();
  }

  public loadAgenda = (): Observable<Agenda> => {
    return this.http.get<Agenda>(`${environment.url_base}/custom/app/agenda`).pipe(
      tap({
        subscribe: () => this.loading.isHidden.set(false),
        next: (resp) => {
          this.storage.set(environment.STORAGE_KEY_AGENDA, resp);
          this.agenda.next(resp);
        },
        error: (err) => this.notify.error(err.error.message),
        finalize: () => this.loading.isHidden.set(true)
      })
    );
  }

  public loadAgendaFromStorage = (): Observable<Agenda> => {
    return from(this.storage.get<Agenda>(environment.STORAGE_KEY_AGENDA))
      .pipe(
        map((value: Agenda | null) => value ?? new Agenda()),
        tap((value: Agenda) => this.agenda.next(value))
      );
  }

}
