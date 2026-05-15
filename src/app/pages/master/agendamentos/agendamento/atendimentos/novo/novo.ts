import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PoComboOption, PoComponentsModule, PoDialogService, PoNotificationService } from '@po-ui/ng-components';
import { ToolbarService } from '../../../../../../core/services/toolbar-service';
import { Agendamento, Atendimento } from '../../../../../../core/models/agenda';
import { Subscription } from 'rxjs';
import { ErpService } from '../../../../../../core/services/erp-service';
import { Geolocation } from '@capacitor/geolocation';
import { StorageService } from '../../../../../../core/services/storage-service';
import { environment } from '../../../../../../core/environments/environment';
import { AuthService } from '../../../../../../core/services/auth-service';

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
  private toolbarService = inject(ToolbarService);
  private erpService = inject(ErpService);
  private storageService = inject(StorageService);
  private authService = inject(AuthService);

  private sub = new Subscription();
  private id = this.route.snapshot.paramMap.get('id');

  public os = signal<Agendamento>(new Agendamento());
  public ocorrencias = signal<PoComboOption[]>([]);
  public status = signal<PoComboOption[]>([{label: 'Aberta', value: '2'},{label: 'Encerrada', value: '1'}]);

  private fb = inject(FormBuilder);

  public form = this.fb.group({
    data: [new Date().toISOString().split('T')[0]],
    inicio: ['', Validators.required],
    fim: ['', Validators.required],
    traslado: [''],
    ocorrencia: ['', Validators.required],
    laudo: ['', [Validators.required, Validators.minLength(10)]],
    status: ['2', [Validators.required]],
    coordenadas: [''],
    endereco: [''],
  });

  constructor() {
    this.toolbarService.title.set('Novo Atendimento');
    this.toolbarService.isShowBtnBack.set(true);

    this.sub.add(
      this.erpService.getAgenda().subscribe(value => {
        const os = value.data.find(a => a.id === this.id) ?? new Agendamento();
        this.os.set(os);
      })
    );

    this.sub.add(
      this.erpService.getOcorrencias().subscribe(value => {
        const ocorrencias: PoComboOption[] = value.data.map(item => ({
          label: item.descricao,
          value: item.codigo
        }));

        this.ocorrencias.set(ocorrencias);
      })
    );

    this.carregarLocalizacaoAtual();
  };

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  };

  public onClickSaveAtendimento = () => {
    this.dialog.confirm({
      
      title: 'Novo atendimento',
      message: 'Confirma os dados do novo atendimento?',
      confirm: async () => {
        
        const atendimento: Atendimento = new Atendimento;
        const form = this.form.value;
        const data = form.data?.split('-');
        
        if(Array.isArray(data) && data.length === 3){
          atendimento.chegada = `${data[2]}/${data[1]}/${data[0]} ${form.inicio?.slice(0,2)}:${form.inicio?.slice(2,4)}`;
          atendimento.inicio = `${data[2]}/${data[1]}/${data[0]} ${form.inicio?.slice(0,2)}:${form.inicio?.slice(2,4)}`;
          atendimento.fim = `${data[2]}/${data[1]}/${data[0]} ${form.fim?.slice(0,2)}:${form.fim?.slice(2,4)}`;
        }

        atendimento.id_os = this.os().id;
        atendimento.os = this.os().os;
        atendimento.tecnico = this.authService.current.tecnico.codtec;
        atendimento.traslado = `${form.traslado?.slice(0,2)}:${form.traslado?.slice(2,4)}`;
        atendimento.ocorrencia = form.ocorrencia ?? '';
        atendimento.situacao = form.status ?? '';
        atendimento.texto = form.laudo ?? '';
        atendimento.coordenadas = form.coordenadas ?? '';
        atendimento.endereco = form.endereco ?? '';
        atendimento.sync = false;

        await this.erpService.novoAtendimento(atendimento);

        this.router.navigate(['/agendamento',this.id,'atendimentos'],{replaceUrl: true});
      }
    });
  };

  private carregarLocalizacaoAtual = async (): Promise<void> => {
    
    let latitude: number | null = null;
    let longitude: number | null = null;

    try {
      
      const permission = await Geolocation.requestPermissions();

      if (permission.location === 'granted') {
        
        const position = await Geolocation.getCurrentPosition({enableHighAccuracy: true,timeout: 10000, maximumAge: 0});

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

      } else {

        this.carregarLocalizacaoBrowser();
        return;

      }

      if (latitude !== null && longitude !== null) {
        const coordenadas = `${latitude}, ${longitude}`;

        this.form.patchValue({
          coordenadas
        });

        this.buscarEndereco(latitude, longitude);
      }

    } catch {
      this.carregarLocalizacaoBrowser();
    }
  };

  private carregarLocalizacaoBrowser = (): void => {

    if (!navigator.geolocation) {
      this.notify.warning('Geolocalização não suportada neste navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const coordenadas = `${latitude}, ${longitude}`;

      this.form.patchValue({ coordenadas });

      this.buscarEndereco(latitude, longitude);
    },
      () => this.notify.warning('Não foi possível obter sua localização.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  private buscarEndereco = async (latitude: number, longitude: number): Promise<void> => {

    try {

      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();
      const endereco = data?.display_name ?? 'Endereço não localizado';

      this.form.patchValue({ endereco });

    } catch {
      this.form.patchValue({ endereco: 'Não foi possível localizar o endereço' });
    }

  };
}
