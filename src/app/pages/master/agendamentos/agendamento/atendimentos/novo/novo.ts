import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PoComponentsModule, PoDialogService, PoNotificationService } from '@po-ui/ng-components';
import { ToolbarService } from '../../../../../../core/services/toolbar-service';
import { Agendamento, Atendimento } from '../../../../../../core/models/agenda';
import { Subscription } from 'rxjs';
import { ErpService } from '../../../../../../core/services/erp-service';
import { Geolocation } from '@capacitor/geolocation';
import { StorageService } from '../../../../../../core/services/storage-service';
import { environment } from '../../../../../../core/environments/environment';

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

  private sub = new Subscription();
  private id = this.route.snapshot.paramMap.get('id');

  public os = signal<Agendamento>(new Agendamento());

  private fb = inject(FormBuilder);

  public form = this.fb.group({
    data: [new Date()],
    inicio: ['', Validators.required],
    fim: ['', Validators.required],
    traslado: [''],
    ocorrencia: ['', Validators.required],
    laudo: ['', [Validators.required, Validators.minLength(10)]],
    status: ['', [Validators.required]],
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
        await this.storageService.set(environment.STORAGE_KEY_ATENDIMENTOS,this.form.value);
        this.router.navigate(['/agendamento',this.id,'atendimentos'],{replaceUrl: true});
      }
    })
  };

  private carregarLocalizacaoAtual = async (): Promise<void> => {
    
    let latitude: number | null = null;
    let longitude: number | null = null;

    try {
      
      const permission = await Geolocation.requestPermissions();

      if (permission.location === 'granted') {
        
        const position = await Geolocation.getCurrentPosition({enableHighAccuracy: true,timeout: 10000, maximumAge: 0});

        console.log('Localizacao Capacitor',position);

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

      console.log('Localizacao Browser',position);

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