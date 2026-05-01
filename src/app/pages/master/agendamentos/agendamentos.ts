import { Component,OnInit,inject,signal,computed} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErpService } from '../../../core/services/erp-service';
import { Agendamento } from '../../../core/models/agenda';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agendamentos.html',
  styleUrl: './agendamentos.scss'
})
export class Agendamentos implements OnInit {

  private erpService = inject(ErpService);
  private router = inject(Router);

  // aba ativa
  aba = signal<'pendente' | 'encerrado'>('pendente');  

  // lista completa
  listaOriginal = signal<Agendamento[]>([]);

  // =========================
  // FILTRO FUNCIONAL
  // =========================
  lista = computed(() => {

    const situacao = this.aba();
    const dados = this.listaOriginal();

    return dados.filter(item =>item.situacao === situacao);

  });

  // =========================
  // INIT
  // =========================
  ngOnInit(): void {

    this.erpService.loadAgendaFromStorage().pipe(finalize(() => {})).subscribe();
    this.erpService.getAgenda().subscribe(agenda => {
        // força nova referência
        const tasks = [...(agenda?.data ?? [])];
        this.listaOriginal.set(tasks);
      }
    );
  }

  goToTask(id: string) {
    this.router.navigate(['/agendamento',id]);
  }

  // troca aba
  setAba(valor: 'pendente' | 'encerrado') {
    this.aba.set(valor);
  }

  // iniciais
  getIniciais(nome?: string): string {
    if (!nome) return '??';
    const partes = nome.split(' ');
    return partes.length === 1 ? partes[0].substring(0,2) : partes[0].substring(0,1) + partes[1].substring(0,1);
  }

  // nome curto
  getNomeCurto(nome?: string): string {
    return nome ? nome.split(' ').slice(0, 2).join(' ') : '';
  }

}
