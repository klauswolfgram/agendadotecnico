import { Component, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoDialogService } from '@po-ui/ng-components';
import { StorageService } from '../../../../../core/services/storage-service';
import { ErpService } from '../../../../../core/services/erp-service';
import { ToolbarService } from '../../../../../core/services/toolbar-service';
import { Subscription } from 'rxjs';
import { Agendamento, Atendimento } from '../../../../../core/models/agenda';

@Component({
  selector: 'app-atendimentos',
  imports: [],
  templateUrl: './atendimentos.html',
  styleUrl: './atendimentos.scss',
})
export class Atendimentos implements OnDestroy {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(PoDialogService);
  private storageService = inject(StorageService);
  private ErpService = inject(ErpService);
  private toolbarService = inject(ToolbarService);
  private sub = new Subscription;

  private id = this.route.snapshot.paramMap.get('id');

  public os = signal<Agendamento>(new Agendamento);
  public atendimentos = signal<Atendimento[]>([]);

  constructor() {
    this.sub.add(this.ErpService.getAgenda().subscribe(value => {
      const os = value.data.find(a => a.id === this.id) ?? new Agendamento;
      this.os.set(os);
      this.atendimentos.set(os.atendimentos);
      this.toolbarService.isShowBtnBack.set(true);
      this.toolbarService.title.set('Atendimentos');
    }))
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public onClickNovo = () => this.router.navigate(['/agendamento',this.id,'atendimentos','novo']);
}
