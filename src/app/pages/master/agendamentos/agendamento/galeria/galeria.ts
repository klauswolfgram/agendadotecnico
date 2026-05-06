import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PoDialogService } from '@po-ui/ng-components';
import { CameraService } from '../../../../../core/services/camera-service';
import { StorageService } from '../../../../../core/services/storage-service';
import { ErpService } from '../../../../../core/services/erp-service';
import { Subscription } from 'rxjs';
import { Foto } from '../../../../../core/models/foto';
import { Agendamento } from '../../../../../core/models/agenda';
import { environment } from '../../../../../core/environments/environment';

@Component({
  selector: 'app-galeria',
  imports: [],
  templateUrl: './galeria.html',
  styleUrl: './galeria.scss',
})

export class Galeria implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private dialog = inject(PoDialogService);
  private cameraService = inject(CameraService);
  private storageService = inject(StorageService);
  private ErpService = inject(ErpService);
  private sub = new Subscription;

  private id = this.route.snapshot.paramMap.get('id');
  
  public os = signal<Agendamento>(new Agendamento);
  public fotos = signal<Foto[] | null>([]);
  public fotoSelecionada = signal<Foto | null>(null);
  public previewFoto = signal<Foto | null>(null);
  public comment = signal<string>('');

  constructor() {
    this.sub.add(this.ErpService.getAgenda().subscribe(value => {
      const os = value.data.find(a => a.id == this.id) ?? new Agendamento;
      this.os.set(os);
    }))
  }

  async ngOnInit() {
    await this.loadfotos();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private loadfotos = async () => {
    
    const fotos = await this.storageService.get<Foto[]>(environment.STORAGE_KEY_GALERIA) || [];
    const fotosOS = fotos.filter(f => f.id_os === this.id && !f.delete);

    this.fotos.set(fotosOS);

  }

}
