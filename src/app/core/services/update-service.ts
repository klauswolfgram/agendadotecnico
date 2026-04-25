import { inject, Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent} from '@angular/service-worker';
import { filter, interval } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  private swUpdate = inject(SwUpdate);

  constructor() {
    if(!this.swUpdate.isEnabled) return;

    this.swUpdate.versionUpdates
    .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
    .subscribe(() => this.activateUpdate());

    interval(30 * 60 * 1000).subscribe(() => this.swUpdate.checkForUpdate());
  }

  private activateUpdate = async () => {
    await this.swUpdate.activateUpdate();
    location.reload();
  }
}
