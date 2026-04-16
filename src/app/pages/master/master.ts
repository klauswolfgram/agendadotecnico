import { Component, inject } from '@angular/core';
import { RouterModule } from "@angular/router";
import { Toolbar } from '../../shared/toolbar/toolbar';
import { Footer } from '../../shared/footer/footer';
import { ToolbarService } from '../../core/services/toolbar-service';

@Component({
  selector: 'app-master',
  imports: [RouterModule,Toolbar,Footer],
  templateUrl: './master.html',
  styleUrl: './master.scss',
})
export class Master {

  private toolbarService = inject(ToolbarService);
  
  constructor() {
    this.toolbarService.isLoggedOn.set(true);
  }
}
