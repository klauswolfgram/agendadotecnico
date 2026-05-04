import { Component, inject, OnDestroy, signal } from '@angular/core';
import { ToolbarService } from '../../../../core/services/toolbar-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ErpService } from '../../../../core/services/erp-service';
import { Agenda, Agendamento as AgendamentoModel} from '../../../../core/models/agenda';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-agendamento',
  imports: [],
  templateUrl: './agendamento.html',
  styleUrl: './agendamento.scss',
})
export class Agendamento implements OnDestroy {

  private toolbarService = inject(ToolbarService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private id = this.route.snapshot.paramMap.get('id');
  private erpService = inject(ErpService); 
  private sub = new Subscription();

  public agendamento = signal<AgendamentoModel>(new AgendamentoModel());

  constructor() {
    this.sub.add(this.erpService.getAgenda().subscribe(value => {
      const agendamento = value.data.find(item => item.id === this.id);
      if(!agendamento) return;
      this.agendamento.set(agendamento);
      this.toolbarService.title.set(`OS ${agendamento.os}`);
    }))
    this.toolbarService.isShowBtnBack.set(true);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public goToGallery = () => this.router.navigate(['/agendamento', this.id, 'galeria']);
  public goToAtendimentos = () => this.router.navigate(['/agendamento', this.id, 'atendimentos']);
  public callToCustomer = () => {
    const telefone = this.agendamento().dadoscliente.telefone;
    window.open(`tel:${telefone}`, '_blank');
  }
  public openMap = () => {
    const endereco = `${this.agendamento().dadoscliente.endereco}, 
                      ${this.agendamento().dadoscliente.cep}, 
                      ${this.agendamento().dadoscliente.bairro}, 
                      ${this.agendamento().dadoscliente.cidade}, 
                      ${this.agendamento().dadoscliente.estado}`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`, '_blank');
  }

}
