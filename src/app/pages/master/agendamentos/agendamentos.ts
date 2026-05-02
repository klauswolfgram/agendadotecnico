import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ErpService } from '../../../core/services/erp-service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Agendamento } from '../../../core/models/agenda';

@Component({
  selector: 'app-agendamentos',
  imports: [],
  templateUrl: './agendamentos.html',
  styleUrl: './agendamentos.scss',
})
export class Agendamentos implements OnInit, OnDestroy {

  private erpService = inject(ErpService);
  private router = inject(Router);
  private sub = new Subscription();

  public aba = signal<'pendente' | 'encerrado'>('pendente');
  public agendamentosOriginais = signal<Agendamento[]>([]);
  public agendamentos = computed(() => {
    const situacao = this.aba();
    const dados = this.agendamentosOriginais();
    return dados.filter(item => item.situacao === situacao);
  })

  constructor() {
    this.sub.add(this.erpService.getAgenda().subscribe(value => this.agendamentosOriginais.set(value.data)));
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public setAba = (valor: 'pendente' | 'encerrado') => {
    this.aba.set(valor);
  }

  public goToTask = (id: string) => this.router.navigate(['agendamento', id]);
  
  public getIniciais = (nome: string):string => {
    const partes = nome.split(' ');
    return partes.length === 1 ? partes[0].substring(0,2) : partes[0].substring(0,1) + partes[1].substring(0,1);
  }

}
