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
import { ToolbarService } from '../../../../../core/services/toolbar-service';
import { FilaIntegracaoService } from '../../../../../core/services/fila-integracao-service';

@Component({
  selector: 'app-galeria',
  imports: [],
  templateUrl: './galeria.html',
  styleUrl: './galeria.scss',
})

export class Galeria implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private dialog = inject(PoDialogService);
  private storageService = inject(StorageService);
  private ErpService = inject(ErpService);
  private toolbarService = inject(ToolbarService);
  private filaIntegracao = inject(FilaIntegracaoService);

  private sub = new Subscription;

  private id = this.route.snapshot.paramMap.get('id');
  
  public cameraService = inject(CameraService);
  public os = signal<Agendamento>(new Agendamento);
  public fotos = signal<Foto[] | null>([]);
  public fotoSelecionada = signal<Foto | null>(null);
  public previewFoto = signal<Foto | null>(null);
  public comment = signal<string>('');

  constructor() {
    this.sub.add(this.ErpService.getAgenda().subscribe(value => {
      const os = value.data.find(a => a.id == this.id) ?? new Agendamento;
      this.os.set(os);
      this.toolbarService.isShowBtnBack.set(true);
      this.toolbarService.title.set(`OS ${os.os} - Fotos`)
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

  private saveFoto = async (base64: string) => {
    
    const all = await this.storageService.get<Foto[]>(environment.STORAGE_KEY_GALERIA) || [];
    const foto = new Foto;

    foto.id = Date.now().toString();
    foto.arq64 = base64;
    foto.id_os = this.os().id;
    foto.filial = this.os().filial;
    foto.numero = this.os().os;
    foto.sync = false;
    foto.delete = false;
    foto.sync_delete = false;
    foto.comment = '';

    all.push(foto);

    await this.storageService.set<Foto[]>(environment.STORAGE_KEY_GALERIA,all);
    await this.filaIntegracao.processarFilaIntegracao();
    await this.loadfotos();
  }  

  public takeFoto = async () => {
    const base64 = await this.cameraService.takeFoto();
    base64 ? await this.saveFoto(base64) : null;
  }

  public selecionarGaleria = async () => {
    const imagens = await this.cameraService.pickFromGallery();
    for (const img of imagens) {
      await this.saveFoto(img);
    }
  }

  public deleteFoto = async (foto: Foto) => {
    this.dialog.confirm({
      title: 'Deletar imagem',
      message: 'Confirmo a deleção da imagem?',
      confirm: async () => {
        const all = await this.storageService.get<Foto[]>(environment.STORAGE_KEY_GALERIA) || [];
        const index = all.findIndex(f => f.id === foto.id);

        if(index >= 0) {
          all[index].delete = true;
          all[index].sync_delete = false;
        }

        await this.storageService.set<Foto[]>(environment.STORAGE_KEY_GALERIA, all);
        await this.filaIntegracao.processarFilaIntegracao();
        await this.loadfotos();
      }
    })
  } 

  public openComment = (foto: Foto) => {
    this.fotoSelecionada.set(foto);
    this.comment.set(foto.comment || '');
  }

  public closeComment = () => this.fotoSelecionada.set(null);

  public saveComment = async () => {
    
    const foto = this.fotoSelecionada();
    if(!foto) return; 

    const all = await this.storageService.get<Foto[]>(environment.STORAGE_KEY_GALERIA) || [];
    const index = all.findIndex(f => f.id === foto.id);

    if(index >= 0) all[index].comment = this.comment();

    await this.storageService.set<Foto[]>(environment.STORAGE_KEY_GALERIA, all);
    await this.filaIntegracao.processarFilaIntegracao();

    this.fotoSelecionada.set(null);

    await this.loadfotos();    

  }

  public verFoto = (foto: Foto) => this.previewFoto.set(foto);
  public fecharFoto = () => this.previewFoto.set(null);

}
