import { Component, inject } from '@angular/core';
import { ToolbarService } from '../../core/services/toolbar-service';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {

  public toolbarService = inject(ToolbarService);

}
