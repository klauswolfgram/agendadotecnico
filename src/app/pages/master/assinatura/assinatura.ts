import { AfterViewInit, Component, ElementRef, HostListener, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { AssinaturaService } from '../../../core/services/assinatura-service';
import { ActivatedRoute } from '@angular/router';
import { ErpService } from '../../../core/services/erp-service';
import { ToolbarService } from '../../../core/services/toolbar-service';
import { PoDialogService, PoNotificationService } from '@po-ui/ng-components';
import { filter, firstValueFrom } from 'rxjs';
import { Assinatura as AssinaturaModel } from '../../../core/models/assinatura';

@Component({
  selector: 'app-assinatura',
  imports: [],
  templateUrl: './assinatura.html',
  styleUrl: './assinatura.scss',
})
export class Assinatura implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('canvasAssinatura') canvasRef!: ElementRef<HTMLCanvasElement>;

  public assinaturaService = inject(AssinaturaService);
  private route = inject(ActivatedRoute);
  private erpService = inject(ErpService);
  private toolbarService = inject(ToolbarService);
  private dialogService = inject(PoDialogService);
  private notifyService = inject(PoNotificationService);

  private contexto: CanvasRenderingContext2D | null = null;
  private desenhando: boolean = false;
  private arq64: string | null = null;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;

  public origem = this.route.snapshot.paramMap.get('origem') || '';
  public id_os = this.route.snapshot.paramMap.get('id_os') || '';
  public id_atendimento = this.route.snapshot.paramMap.get('id_atendimento') || '';
  public id_assinatura: string = '';
  public assinatura = signal<AssinaturaModel | null>(null);
  public possuiRisco = signal<boolean>(false);

  constructor() {
    this.toolbarService.isShowBtnBack.set(true);
    this.toolbarService.title.set('Assinatura');
    this.assinaturaService.origem.set(this.origem.charAt(0).toUpperCase() + this.origem.slice(1));
  }

  async ngOnInit() {

    await this.assinaturaService.loadFromStorage();

    const agenda = await firstValueFrom(this.erpService.getAgenda().pipe(
      filter(agenda => agenda.data.some(item => item.id === this.id_os))
    ));
    const os = agenda.data.find(item => item.id === this.id_os);

    if (!os) return;

    switch (this.origem) {

      case 'agendamento':
        this.id_assinatura = os.id_assinatura;
        break;
      case 'atendimento':
        const atendimento = os.atendimentos.find(item => item.id === this.id_atendimento);
        this.id_assinatura = atendimento?.id_assinatura || '';
        break;
      default:
        return;
    }

    const assinatura = await this.assinaturaService.getById(this.id_assinatura);
    this.possuiRisco.set(!!assinatura?.arq64);
    this.assinatura.set(assinatura);
    this.arq64 = assinatura?.arq64 || null;
    this.carregarImagem(this.arq64);

  }

  ngAfterViewInit(): void {
    this.prepararCanvas();
  }

  ngOnDestroy(): void {
    if(this.resizeTimeout) clearTimeout(this.resizeTimeout);
  }

  @HostListener('window:resize')
  public redimensionarCanvas = () => {

    if(this.resizeTimeout) clearTimeout(this.resizeTimeout);

    this.resizeTimeout = setTimeout(() => {
      const canvas = this.canvasRef.nativeElement;
      const imagemAtual = this.possuiRisco() ? canvas.toDataURL('image/png').split(',')[1] : this.arq64;
      this.prepararCanvas(imagemAtual);
    }, 150);

  }

  private prepararCanvas = (imagem: string | null = this.arq64) => {

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    this.contexto = canvas.getContext('2d');
    if (!this.contexto) return;

    this.contexto.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.contexto.fillStyle = '#ffffff';
    this.contexto.fillRect(0, 0, rect.width, rect.height);
    this.contexto.lineWidth = 3;
    this.contexto.lineCap = 'round';
    this.contexto.lineJoin = 'round';
    this.contexto.strokeStyle = '#111827';

    this.carregarImagem(imagem);

  }

  private carregarImagem = (arq64: string | null) => {

    if (!arq64 || !this.contexto) return;

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const img = new Image();

    img.onload = () => {
      this.contexto?.drawImage(img, 0, 0, rect.width, rect.height);
    }

    img.src = `data:image/png;base64,${arq64}`;
  }

  private getPonto = (event: PointerEvent) => {

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  public iniciarDesenho = (event: PointerEvent) => {

    if (!this.contexto) return;

    const ponto = this.getPonto(event);

    this.desenhando = true;
    this.possuiRisco.set(true);
    this.contexto.beginPath();
    this.contexto.moveTo(ponto.x, ponto.y);

  }

  public desenhar = (event: PointerEvent) => {

    if (!this.contexto || !this.desenhando) return;

    event.preventDefault();
    const ponto = this.getPonto(event);
    this.contexto.lineTo(ponto.x, ponto.y);
    this.contexto.stroke();
  }

  public finalizarDesenho = () => {
    if (!this.contexto) return;
    this.desenhando = false;
    this.contexto.closePath();
  }

  public salvar = async () => {

    if (!this.possuiRisco()) {
      this.notifyService.warning({ duration: 1500, message: 'Nenhum desenho encontrado.' });
      return
    }

    const arq64 = this.canvasRef.nativeElement.toDataURL('image/png').split(',')[1];
    const assinatura = await this.assinaturaService.salvar(arq64, this.id_assinatura);

    this.id_assinatura = assinatura.id;

    await this.salvarVinculoAssinatura(assinatura.id);

    this.assinatura.set(assinatura);
    this.arq64 = assinatura.arq64;
    this.notifyService.success({ duration: 1500, message: 'Assinatura salva com sucesso.' });

    window.history.back();

  }

  private salvarVinculoAssinatura = async (id_assinatura: string) => {

    if (this.origem === 'agendamento') {
      await this.erpService.setAssinaturaAgendamento(this.id_os, id_assinatura);
      return;
    }

    if (this.origem === 'atendimento') {
      await this.erpService.setAssinaturaAtendimento(this.id_os, this.id_atendimento, id_assinatura);
      return;
    }

  }

  public limpar = () => {
    this.arq64 = null;
    this.assinatura.set(null);
    this.possuiRisco.set(false);
    this.prepararCanvas();
  }

  public apagar = () => {

    const assinatura = this.assinatura();

    if (!assinatura) {
      this.limpar();
      return;
    }

    this.dialogService.confirm({
      title: 'Apagar assinatura?',
      message: 'Confirma a deleção da assinatura?',
      confirm: async () => {
        await this.assinaturaService.apagar(assinatura);
        await this.salvarVinculoAssinatura('');
        this.limpar();
        this.notifyService.success({ duration: 1500, message: 'Assinatura apagada.' });
        window.history.back();
      }
    })
  }

}
