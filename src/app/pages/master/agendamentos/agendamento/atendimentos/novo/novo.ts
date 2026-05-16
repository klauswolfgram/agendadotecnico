import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoComboOption, PoComponentsModule, PoDialogService, PoNotificationService } from '@po-ui/ng-components';
import { ToolbarService } from '../../../../../../core/services/toolbar-service';
import { StorageService } from '../../../../../../core/services/storage-service';
import { ErpService } from '../../../../../../core/services/erp-service';
import { AuthService } from '../../../../../../core/services/auth-service';
import { Subscription } from 'rxjs';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Agendamento, Atendimento } from '../../../../../../core/models/agenda';
import { Geolocation } from '../../../../../../core/services/geolocation';

@Component({
  selector: 'app-novo',
  imports: [ReactiveFormsModule, PoComponentsModule],
  templateUrl: './novo.html',
  styleUrl: './novo.scss',
})
export class Novo implements OnDestroy {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(PoDialogService);
  private notify = inject(PoNotificationService);
  private toolbar = inject(ToolbarService);
  private storage = inject(StorageService);
  private geolocation = inject(Geolocation);

  public erp = inject(ErpService);
  private auth = inject(AuthService);

  private sub = new Subscription;

  private id = this.route.snapshot.paramMap.get('id');
  public os = signal<Agendamento>(new Agendamento);
  public ocorrencias = computed<PoComboOption[]>(() => this.erp.ocorrencias().map(e => ({value: e.codigo, label: e.descri})));
  public status_os = signal<PoComboOption[]>([{label: 'Aberta', value: '2'},{label: 'Encerrada',value: '1'}]);

  private fb = inject(FormBuilder);
  public form = this.fb.group({
    data: [new Date().toISOString().split('T')[0]],
    inicio: ['', Validators.required],
    fim: ['', Validators.required],
    traslado: [''],
    ocorrencia: ['',Validators.required],
    laudo: ['',[Validators.required,Validators.minLength(5)]],
    status_os: ['' ,Validators.required],
    coordenadas: ['',Validators.required],
    endereco: [''],
  });

  constructor() {
    
    this.toolbar.isShowBtnBack.set(true);
    this.toolbar.title.set('Novo Atendimento');

    this.carregarLocalizacao();

    this.sub.add(this.erp.getAgenda().subscribe(value => {
      const os = value.data.find(a => a.id === this.id) ?? new Agendamento;
      this.os.set(os);
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public onConfirm = () => {
    this.dialog.confirm({
      title: 'Salvar Atendimento',
      message: 'Confirma o salvamento do atendimento?',
      confirm: async () => {
        const novoAtendimento: Atendimento = new Atendimento;
        const form = this.form.value;

        const data = form.data?.split('-');
        
        if(Array.isArray(data) && data.length === 3){
          const dataFormatada = `${data[2]}/${data[1]}/${data[0]}`;
          novoAtendimento.chegada = `${dataFormatada} ${form.inicio?.slice(0,2)}:${form.inicio?.slice(2,4)}`;
          novoAtendimento.inicio = `${dataFormatada} ${form.inicio?.slice(0,2)}:${form.inicio?.slice(2,4)}`;
          novoAtendimento.fim = `${dataFormatada} ${form.fim?.slice(0,2)}:${form.fim?.slice(2,4)}`;
        }

        novoAtendimento.id_os = this.os().id;
        novoAtendimento.os = this.os().os;
        novoAtendimento.tecnico = this.auth.current.tecnico.codtec;
        novoAtendimento.traslado = `${form.traslado?.slice(0,2)}:${form.traslado?.slice(2,4)}`;
        novoAtendimento.ocorrencia = form.ocorrencia ?? '';
        novoAtendimento.situacao = form.status_os ?? '2';
        novoAtendimento.texto = form.laudo ?? '';
        novoAtendimento.coordenadas = form.coordenadas ?? '';
        novoAtendimento.endereco = form.endereco ?? '';

        await this.erp.setNovoAtendimento(novoAtendimento);

        this.router.navigate(['/agendamento',this.id,'atendimentos'],{replaceUrl: true});
      }
    });
  }

  private carregarLocalizacao = async () => {
    await this.geolocation.carregarLocalizacaoAtual();
    this.form.patchValue({coordenadas: this.geolocation.coordenadas(), endereco: this.geolocation.endereco()});
  }
}
