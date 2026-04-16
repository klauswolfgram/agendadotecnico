import { Component, inject } from '@angular/core';
import { ToolbarService } from '../../core/services/toolbar-service';

@Component({
  selector: 'app-toolbar',
  imports: [],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar {

  public toolbarService = inject(ToolbarService);

}
