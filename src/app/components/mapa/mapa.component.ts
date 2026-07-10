import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';

import * as L from 'leaflet';

import { MatSnackBar } from '@angular/material/snack-bar';
import { VeiculoService } from '../../services/veiculo.service';
import { VeiculoComMotorista } from '../../models/veiculo.model';
import { MotoristaService } from '../../services/motorista.service';
import { RastreamentoService, Coordenada } from '../../services/rastreamento.service';
import { RoteamentoService } from '../../services/roteamento.service';
import { SelecaoService } from '../../services/selecao.service';
import { BuscaGlobalService } from '../../services/busca-global.service';
import { PONTOS_REFERENCIA_POA } from '../../utils/geo.util';

const PONTOS_VAZIOS: Coordenada[] = [];

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSliderModule,
    MatExpansionModule,
  ],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.scss',
})
export class MapaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  protected readonly veiculoService = inject(VeiculoService);
  protected readonly motoristaService = inject(MotoristaService);
  protected readonly rastreamentoService = inject(RastreamentoService);
  protected readonly selecaoService = inject(SelecaoService);
  protected readonly buscaService = inject(BuscaGlobalService);
  private readonly roteamentoService = inject(RoteamentoService);
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Cor do traçado, lida do token da marca em vez de duplicada aqui.
   * O fallback só entra se a folha de estilo ainda não resolveu.
   */
  private corTrajeto(): string {
    const valor = getComputedStyle(document.documentElement)
      .getPropertyValue('--app-marcador-fundo')
      .trim();
    return valor || '#2e6ef5';
  }

  // Sinais de controle
  readonly isSimulando = signal(false);
  readonly isGpsAtivo = signal(false);
  readonly isCarregandoRota = signal(false);
  readonly usouFallback = signal(false);
  readonly latManual = signal<number | null>(null);
  readonly lngManual = signal<number | null>(null);

  // Replay de histórico
  readonly modoReplay = signal(false);
  readonly replayIndex = signal(0);
  readonly replayVelocidade = signal(1);
  readonly isReplayTocando = signal(false);
  readonly velocidades = [1, 2, 4, 8];

  protected readonly veiculosComMotorista = this.veiculoService.veiculosComMotorista;

  /** Veículo selecionado (para o painel de detalhe da sidebar). */
  protected readonly veiculoSelecionado = computed(() => {
    const id = this.selecaoService.veiculoSelecionadoId();
    return id ? this.veiculosComMotorista().find((v) => v.id === id) : undefined;
  });

  /** Motorista selecionado sem veículo associado (fallback do painel de detalhe). */
  protected readonly motoristaSemVeiculoSelecionado = computed(() => {
    const id = this.selecaoService.motoristaSemVeiculoId();
    return id ? this.motoristaService.buscarPorId(id) : undefined;
  });

  // Pontos do veículo atualmente selecionado
  readonly pontosDoVeiculoSelecionado = computed<Coordenada[]>(() => {
    const id = this.selecaoService.veiculoSelecionadoId();
    return id ? (this.rastreamentoService.pontosPorVeiculo()[id] ?? PONTOS_VAZIOS) : PONTOS_VAZIOS;
  });
  readonly totalPontos = computed(() => this.pontosDoVeiculoSelecionado().length);
  readonly temTrilhaSelecionado = computed(() => this.totalPontos() > 0);

  readonly pontosVisiveis = computed<Coordenada[]>(() => {
    const todos = this.pontosDoVeiculoSelecionado();
    return this.modoReplay() ? todos.slice(0, this.replayIndex() + 1) : todos;
  });

  // Referências do Leaflet
  private map!: L.Map;
  private marker?: L.Marker;
  private polyline?: L.Polyline;
  private readonly marcadoresEstaticos = new Map<string, L.Marker>();

  /** Silhueta de carro (branca) usada dentro do pino azul do marcador. */
  private readonly svgCarro = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`;

  /** Marcador padrão: pino/círculo azul da marca com o carro branco. */
  private readonly iconeVeiculoEstatico = L.divIcon({
    className: 'marcador-carro-container',
    html: `<div class="marcador-carro">${this.svgCarro}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  /** Marcador destacado do veículo selecionado (maior, com anel). */
  private readonly iconeVeiculoSelecionado = L.divIcon({
    className: 'marcador-carro-container',
    html: `<div class="marcador-carro marcador-carro-selecionado">${this.svgCarro}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  // Variáveis da simulação
  private simularIntervalId?: any;
  private rotaSimuladaPoints: [number, number][] = [];
  private indexSimulacao = 0;

  // Variável do GPS
  private gpsWatchId?: number;

  // Variável do replay
  private replayTimeoutId?: any;

  constructor() {
    // Sincroniza os marcadores estáticos com a frota, a seleção e a trilha ativa
    effect(() => {
      this.veiculosComMotorista();
      this.selecaoService.veiculoSelecionadoId();
      this.temTrilhaSelecionado();
      this.sincronizarMarcadoresEstaticos();
    });

    // Redesenha a trilha (polyline + marcador vivo) do veículo selecionado
    effect(() => {
      const veiculoId = this.selecaoService.veiculoSelecionadoId();
      if (!veiculoId) {
        this.limparCamadasMapa();
        return;
      }

      this.desenharRota(this.pontosVisiveis());
    });

    // Ao trocar a seleção, encerra qualquer captura em andamento
    effect(() => {
      this.selecaoService.veiculoSelecionadoId();
      this.selecaoService.motoristaSemVeiculoId();
      this.pararSimulacao();
      this.pararGps();
      this.sairModoReplay();
    });
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
    this.buscaService.definirResultadosInline(true);

    // Render inicial: os effects podem ter rodado antes do mapa existir.
    this.sincronizarMarcadoresEstaticos();
    this.desenharRota(this.pontosVisiveis());
  }

  ngOnDestroy(): void {
    this.pararSimulacao();
    this.pararGps();
    this.pausarReplay();
    this.buscaService.definirResultadosInline(false);

    if (this.map) {
      this.map.remove();
    }
  }

  // ------------------------------------------------------------ Busca sidebar

  aoDigitarBusca(evento: Event): void {
    this.buscaService.definirTermo((evento.target as HTMLInputElement).value);
  }

  limparBusca(): void {
    this.buscaService.definirTermo('');
  }

  /**
   * Inicializa o mapa do Leaflet centralizado em Porto Alegre. O mapa nunca
   * recentraliza sozinho depois disso — fica estático para mostrar toda a frota.
   */
  private inicializarMapa(): void {
    const portoAlegre: L.LatLngExpression = [-30.0346, -51.2177];

    this.map = L.map(this.mapContainer.nativeElement).setView(portoAlegre, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  /**
   * Mantém um marcador estático por veículo cadastrado (posição de cadastro).
   * O veículo selecionado com trilha ativa é representado pelo marcador "vivo"
   * de `desenharRota` em vez do estático, para não duplicar o pino.
   */
  private sincronizarMarcadoresEstaticos(): void {
    if (!this.map) return;

    const veiculos = this.veiculosComMotorista();
    const idsAtuais = new Set(veiculos.map((v) => v.id));
    const selecionadoId = this.selecaoService.veiculoSelecionadoId();
    const temTrilha = this.temTrilhaSelecionado();

    for (const [id, marcador] of this.marcadoresEstaticos) {
      if (!idsAtuais.has(id)) {
        marcador.remove();
        this.marcadoresEstaticos.delete(id);
      }
    }

    for (const veiculo of veiculos) {
      const ehSelecionadoComTrilha = veiculo.id === selecionadoId && temTrilha;

      if (ehSelecionadoComTrilha) {
        const existente = this.marcadoresEstaticos.get(veiculo.id);
        if (existente) {
          existente.remove();
          this.marcadoresEstaticos.delete(veiculo.id);
        }
        continue;
      }

      const posicao: L.LatLngExpression = [veiculo.lat, veiculo.lng];
      const conteudoTooltip = this.montarTooltip(veiculo);
      const icone = veiculo.id === selecionadoId ? this.iconeVeiculoSelecionado : this.iconeVeiculoEstatico;
      const existente = this.marcadoresEstaticos.get(veiculo.id);

      if (existente) {
        existente.setLatLng(posicao);
        existente.setTooltipContent(conteudoTooltip);
        existente.setIcon(icone);
      } else {
        const marcador = L.marker(posicao, { icon: icone })
          .addTo(this.map)
          .bindTooltip(conteudoTooltip, { direction: 'top', offset: [0, -12] })
          .on('click', () => this.selecaoService.selecionarVeiculo(veiculo.id));
        this.marcadoresEstaticos.set(veiculo.id, marcador);
      }
    }
  }

  /** Aviso não bloqueante, no mesmo vocabulário do resto do app. */
  private avisar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
  }

  /**
   * `GeolocationPositionError.message` vem do navegador, em inglês e técnico.
   * O usuário precisa saber o que fazer, não o que falhou.
   */
  private mensagemDeErroGps(erro: GeolocationPositionError): string {
    switch (erro.code) {
      case erro.PERMISSION_DENIED:
        return 'Permissão de localização negada. Autorize o acesso nas configurações do navegador.';
      case erro.POSITION_UNAVAILABLE:
        return 'Não foi possível determinar a posição do dispositivo.';
      case erro.TIMEOUT:
        return 'O dispositivo demorou demais para responder. Tente novamente.';
      default:
        return 'Não foi possível rastrear o dispositivo.';
    }
  }

  /**
   * Monta o tooltip como nós de DOM. O Leaflet aplica string de tooltip via
   * `innerHTML`, então marca, modelo, placa e nome do motorista — todos campos
   * preenchidos por usuário — seriam executados como HTML. `textContent` fecha
   * essa porta sem precisar de sanitização.
   */
  private montarTooltip(veiculo: VeiculoComMotorista): HTMLElement {
    const raiz = document.createElement('div');

    const titulo = document.createElement('strong');
    titulo.textContent = `${veiculo.marca} ${veiculo.modelo}`;

    const detalhe = document.createElement('div');
    detalhe.textContent = `${veiculo.placa} · ${veiculo.nomeMotorista}`;

    raiz.append(titulo, detalhe);
    return raiz;
  }

  /**
   * Executa a renderização reativa da trilha (polyline + marcador pulsante)
   * do veículo selecionado. O mapa nunca recentraliza a partir daqui.
   */
  private desenharRota(pontos: Coordenada[]): void {
    if (!this.map) return;

    if (this.polyline) {
      this.polyline.remove();
      this.polyline = undefined;
    }

    if (pontos.length >= 2) {
      const latlngs = pontos.map((p) => [p.lat, p.lng] as L.LatLngExpression);
      this.polyline = L.polyline(latlngs, {
        color: this.corTrajeto(),
        weight: 4,
        opacity: 0.9,
      }).addTo(this.map);
    }

    if (pontos.length > 0) {
      const ultimoPonto = pontos[pontos.length - 1];
      const novaPosicao: L.LatLngExpression = [ultimoPonto.lat, ultimoPonto.lng];

      if (!this.marker) {
        const iconeCustomizado = L.divIcon({
          className: 'marcador-pulsante-container',
          html: `
            <div class="marcador-pulsante-anel"></div>
            <div class="marcador-pulsante-ponto"></div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        this.marker = L.marker(novaPosicao, { icon: iconeCustomizado }).addTo(this.map);
      } else {
        this.marker.setLatLng(novaPosicao);
      }
    } else if (this.marker) {
      this.marker.remove();
      this.marker = undefined;
    }
  }

  /**
   * Limpa todos os elementos visuais do trajeto (marcador e polyline)
   */
  private limparCamadasMapa(): void {
    if (this.polyline) {
      this.polyline.remove();
      this.polyline = undefined;
    }
    if (this.marker) {
      this.marker.remove();
      this.marker = undefined;
    }
  }

  // ------------------------------------------------------------ Simulação

  /**
   * Inicia a simulação de deslocamento com rota grudada nas ruas (OSRM),
   * caindo para interpolação linear caso o roteamento falhe.
   */
  async iniciarSimulacao(): Promise<void> {
    const veiculoId = this.selecaoService.veiculoSelecionadoId();
    if (!veiculoId) return;

    this.pararSimulacao();
    this.pararGps();
    this.sairModoReplay();

    // Obtém a geometria da rota nas ruas; em falha usa o fallback linear.
    this.isCarregandoRota.set(true);
    this.usouFallback.set(false);
    try {
      this.rotaSimuladaPoints = await this.roteamentoService.obterRotaRodoviaria(PONTOS_REFERENCIA_POA);
    } catch (erro) {
      console.warn('Falha no roteamento OSRM; usando interpolação linear.', erro);
      this.usouFallback.set(true);
      this.rotaSimuladaPoints = this.interpolarRota(
        PONTOS_REFERENCIA_POA.map((w) => [w.lat, w.lng] as [number, number]),
        12,
      );
    } finally {
      this.isCarregandoRota.set(false);
    }

    if (this.rotaSimuladaPoints.length === 0) return;

    this.indexSimulacao = 0;
    this.isSimulando.set(true);

    // Enviar o primeiro ponto imediatamente
    const primeiroPonto = this.rotaSimuladaPoints[this.indexSimulacao];
    this.rastreamentoService.pushPoint(veiculoId, primeiroPonto[0], primeiroPonto[1]);
    this.indexSimulacao++;

    // Configurar o intervalo de atualização
    this.simularIntervalId = setInterval(() => {
      if (this.indexSimulacao < this.rotaSimuladaPoints.length) {
        const pt = this.rotaSimuladaPoints[this.indexSimulacao];
        this.rastreamentoService.pushPoint(veiculoId, pt[0], pt[1]);
        this.indexSimulacao++;
      } else {
        this.pararSimulacao();
      }
    }, 700);
  }

  /**
   * Interrompe a simulação
   */
  pararSimulacao(): void {
    if (this.simularIntervalId) {
      clearInterval(this.simularIntervalId);
      this.simularIntervalId = undefined;
    }
    this.isSimulando.set(false);
  }

  // ------------------------------------------------------------------ GPS

  /**
   * Inicia o rastreamento via GPS do dispositivo
   */
  iniciarGps(): void {
    const veiculoId = this.selecaoService.veiculoSelecionadoId();
    if (!veiculoId) return;

    this.pararSimulacao();
    this.pararGps();
    this.sairModoReplay();

    if (!navigator.geolocation) {
      this.avisar('Este navegador não oferece geolocalização.');
      return;
    }

    this.isGpsAtivo.set(true);

    this.gpsWatchId = navigator.geolocation.watchPosition(
      (posicao) => {
        const { latitude, longitude } = posicao.coords;
        this.rastreamentoService.pushPoint(veiculoId, latitude, longitude);
      },
      (erro) => {
        this.avisar(this.mensagemDeErroGps(erro));
        this.pararGps();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 8000,
      },
    );
  }

  /**
   * Encerra o rastreamento via GPS
   */
  pararGps(): void {
    if (this.gpsWatchId !== undefined) {
      navigator.geolocation.clearWatch(this.gpsWatchId);
      this.gpsWatchId = undefined;
    }
    this.isGpsAtivo.set(false);
  }

  /**
   * Adiciona uma coordenada manualmente informada
   */
  adicionarPontoManual(): void {
    const veiculoId = this.selecaoService.veiculoSelecionadoId();
    const lat = this.latManual();
    const lng = this.lngManual();

    if (!veiculoId || lat === null || lng === null) return;

    this.sairModoReplay();
    this.rastreamentoService.pushPoint(veiculoId, lat, lng);

    // Limpar os campos do formulário
    this.latManual.set(null);
    this.lngManual.set(null);
  }

  /**
   * Limpa a rota tracejada do veículo selecionado, mantendo a última posição ativa
   */
  limparRota(): void {
    const veiculoId = this.selecaoService.veiculoSelecionadoId();
    if (veiculoId) {
      this.sairModoReplay();
      this.rastreamentoService.limparRota(veiculoId);
    }
  }

  // ------------------------------------------------- Replay de histórico

  entrarModoReplay(): void {
    if (this.totalPontos() < 2) return;
    this.pararSimulacao();
    this.pararGps();
    this.modoReplay.set(true);
    this.replayIndex.set(0);
  }

  sairModoReplay(): void {
    this.pausarReplay();
    if (this.modoReplay()) this.modoReplay.set(false);
  }

  tocarReplay(): void {
    const pontos = this.pontosDoVeiculoSelecionado();
    if (pontos.length < 2) return;
    if (this.replayIndex() >= pontos.length - 1) this.replayIndex.set(0);
    this.isReplayTocando.set(true);
    this.agendarProximoReplay();
  }

  pausarReplay(): void {
    if (this.replayTimeoutId) {
      clearTimeout(this.replayTimeoutId);
      this.replayTimeoutId = undefined;
    }
    this.isReplayTocando.set(false);
  }

  aoMudarReplayIndex(valor: number): void {
    this.pausarReplay();
    this.replayIndex.set(Math.round(valor));
  }

  definirVelocidade(velocidade: number): void {
    this.replayVelocidade.set(velocidade);
  }

  /**
   * Agenda o próximo passo do replay respeitando o intervalo real entre os
   * timestamps dos pontos, dividido pelo multiplicador de velocidade.
   */
  private agendarProximoReplay(): void {
    const pontos = this.pontosDoVeiculoSelecionado();
    const i = this.replayIndex();

    if (i >= pontos.length - 1) {
      this.pausarReplay();
      return;
    }

    const atual = new Date(pontos[i].timestamp).getTime();
    const proximo = new Date(pontos[i + 1].timestamp).getTime();
    let delta = proximo - atual;

    // Fallback e limites para manter o replay fluido e assistível.
    if (!isFinite(delta) || delta <= 0) delta = 600;
    delta = Math.min(delta, 2000);
    const espera = delta / this.replayVelocidade();

    this.replayTimeoutId = setTimeout(() => {
      this.replayIndex.set(this.replayIndex() + 1);
      this.agendarProximoReplay();
    }, espera);
  }

  /**
   * Interpolação linear simples para suavizar o percurso da simulação (fallback)
   */
  private interpolarRota(waypoints: [number, number][], passosPorTrecho = 12): [number, number][] {
    const pontosInterpolados: [number, number][] = [];

    for (let i = 0; i < waypoints.length - 1; i++) {
      const inicio = waypoints[i];
      const fim = waypoints[i + 1];

      for (let j = 0; j < passosPorTrecho; j++) {
        const t = j / passosPorTrecho;
        const lat = inicio[0] + (fim[0] - inicio[0]) * t;
        const lng = inicio[1] + (fim[1] - inicio[1]) * t;
        pontosInterpolados.push([lat, lng]);
      }
    }

    // Adicionar o ponto final
    pontosInterpolados.push(waypoints[waypoints.length - 1]);
    return pontosInterpolados;
  }
}
