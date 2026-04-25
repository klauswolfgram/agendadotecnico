import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { environment } from './core/environments/environment';
import { RouterModule } from "@angular/router";
import { PoLoadingModule } from "@po-ui/ng-components";
import { LoadingService } from './core/services/loading-service';
import { UpdateService } from './core/services/update-service';

@Component({
  selector: 'app-root',
  imports: [RouterModule, PoLoadingModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {

  private serviceUpdate = inject(UpdateService);
  public serviceLoading = inject(LoadingService);
  
  constructor() {
    //alert(`Ambiente ${environment.ambiente}`);
    console.log(`Ambiente ${environment.ambiente}`);
  }

}
