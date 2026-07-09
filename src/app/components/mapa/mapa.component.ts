import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';

import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';

import { VeiculoService } from '../../services/veiculo.service';
import { RastreamentoService, Coordenada } from '../../services/rastreamento.service';
import { RoteamentoService } from '../../services/roteamento.service';
import { CercaVirtualService } from '../../services/cerca-virtual.service';
import { CercaVirtual, PontoGeo } from '../../models/cerca-virtual.model';

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
    MatSelectModule,
    MatTooltipModule,
    MatSliderModule,
  ],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.scss',
})
export class MapaComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  protected readonly veiculoService = inject(VeiculoService);
  protected readonly rastreamentoService = inject(RastreamentoService);
  protected readonly cercaService = inject(CercaVirtualService);
  private readonly roteamentoService = inject(RoteamentoService);
  private readonly router = inject(Router);

  /** Cor da marca Movva para o traçado do trajeto (azul primário). */
  private readonly corTrajeto = '#2e6ef5';

  /** Cor padrão das cercas virtuais (vermelho de perigo). */
  private readonly corCerca = '#e5484d';

  // Sinais de controle
  readonly veiculoSelecionadoId = signal<string>('');
  readonly isSimulando = signal(false);
  readonly isGpsAtivo = signal(false);
  readonly isCarregandoRota = signal(false);
  readonly usouFallback = signal(false);
  readonly latManual = signal<number | null>(null);
  readonly lngManual = signal<number | null>(null);

  // Cercas virtuais (geofencing)
  readonly modoDesenho = signal(false);

  // Replay de histórico
  readonly modoReplay = signal(false);
  readonly replayIndex = signal(0);
  readonly replayVelocidade = signal(1);
  readonly isReplayTocando = signal(false);
  readonly velocidades = [1, 2, 4, 8];

  // Pontos do veículo atualmente selecionado
  readonly pontosDoVeiculo = computed<Coordenada[]>(() => {
    const id = this.veiculoSelecionadoId();
    return id ? this.rastreamentoService.pontosPorVeiculo()[id] || [] : [];
  });
  readonly totalPontos = computed(() => this.pontosDoVeiculo().length);

  // Referências do Leaflet
  private map!: L.Map;
  private marker?: L.Marker;
  private polyline?: L.Polyline;
  private readonly cercaLayers = new Map<string, L.Layer>();

  // Variáveis da simulação
  private simularIntervalId?: any;
  private rotaSimuladaPoints: [number, number][] = [];
  private indexSimulacao = 0;

  // Variável do GPS
  private gpsWatchId?: number;

  // Variável do replay
  private replayTimeoutId?: any;

  constructor() {
    // Redesenha o trajeto quando o veículo muda, novas coordenadas chegam ou o replay avança
    effect(() => {
      const veiculoId = this.veiculoSelecionadoId();
      if (!veiculoId) {
        this.limparCamadasMapa();
        return;
      }

      const todos = this.pontosDoVeiculo();
      const visiveis = this.modoReplay() ? todos.slice(0, this.replayIndex() + 1) : todos;
      this.desenharRota(visiveis);
    });

    // Redesenha as cercas virtuais sempre que a coleção muda
    effect(() => {
      const cercas = this.cercaService.cercas();
      this.renderizarCercas(cercas);
    });
  }

  ngOnInit(): void {
    // Selecionar o primeiro veículo da lista por padrão, se disponível
    const veiculos = this.veiculoService.listarTodos();
    if (veiculos.length > 0) {
      this.veiculoSelecionadoId.set(veiculos[0].id);
    }
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
    this.configurarGeoman();

    // Render inicial: os effects podem ter rodado antes do mapa existir.
    this.renderizarCercas(this.cercaService.cercas());
    this.desenharRota(this.pontosDoVeiculo());
  }

  ngOnDestroy(): void {
    this.pararSimulacao();
    this.pararGps();
    this.pausarReplay();

    if (this.map) {
      this.map.remove();
    }
  }

  /**
   * Inicializa o mapa do Leaflet centralizado em Porto Alegre
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
   * Configura o plugin Leaflet-Geoman (usado apenas para desenhar cercas).
   */
  private configurarGeoman(): void {
    this.map.on('pm:create', (evento: any) => this.aoCriarCerca(evento));
  }

  /**
   * Executa a renderização reativa do trajeto e marcador
   */
  private desenharRota(pontos: Coordenada[]): void {
    if (!this.map) return;

    // Limpar polyline anterior se houver
    if (this.polyline) {
      this.polyline.remove();
      this.polyline = undefined;
    }

    // Desenha a polyline do trajeto se tivermos 2 ou mais pontos
    if (pontos.length >= 2) {
      const latlngs = pontos.map((p) => [p.lat, p.lng] as L.LatLngExpression);
      this.polyline = L.polyline(latlngs, {
        color: this.corTrajeto,
        weight: 4,
        opacity: 0.9,
        pmIgnore: true,
      }).addTo(this.map);
    }

    // Desenha ou atualiza o marcador na última posição conhecida
    if (pontos.length > 0) {
      const ultimoPonto = pontos[pontos.length - 1];
      const novaPosicao: L.LatLngExpression = [ultimoPonto.lat, ultimoPonto.lng];

      if (!this.marker) {
        // Ícone personalizado usando divIcon para evitar bugs de bundler e ter visual pulsante premium
        const iconeCustomizado = L.divIcon({
          className: 'marcador-pulsante-container',
          html: `
            <div class="marcador-pulsante-anel"></div>
            <div class="marcador-pulsante-ponto"></div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        this.marker = L.marker(novaPosicao, { icon: iconeCustomizado, pmIgnore: true }).addTo(this.map);
      } else {
        this.marker.setLatLng(novaPosicao);
      }

      // Centralizar o mapa sempre no novo ponto
      this.map.setView(novaPosicao, this.map.getZoom());
    } else {
      // Remove o marcador se não existirem pontos
      if (this.marker) {
        this.marker.remove();
        this.marker = undefined;
      }
    }
  }

  /**
   * Renderiza as cercas virtuais (círculos e polígonos) armazenadas no serviço.
   */
  private renderizarCercas(cercas: CercaVirtual[]): void {
    if (!this.map) return;

    // Recria as camadas (as cercas são poucas; redesenhar é simples e seguro)
    for (const layer of this.cercaLayers.values()) layer.remove();
    this.cercaLayers.clear();

    for (const cerca of cercas) {
      const cor = cerca.cor || this.corCerca;
      const estilo = {
        color: cor,
        weight: 2,
        fillColor: cor,
        fillOpacity: 0.12,
        pmIgnore: true,
      } as L.PathOptions;

      let layer: L.Layer | undefined;
      if (cerca.tipo === 'circulo' && cerca.centro && cerca.raio != null) {
        layer = L.circle([cerca.centro.lat, cerca.centro.lng], { radius: cerca.raio, ...estilo });
      } else if (cerca.tipo === 'poligono' && cerca.vertices?.length) {
        const anel = cerca.vertices.map((v) => [v.lat, v.lng] as L.LatLngExpression);
        layer = L.polygon(anel, estilo);
      }

      if (layer) {
        layer.addTo(this.map);
        layer.bindTooltip(cerca.nome, { direction: 'top' });
        this.cercaLayers.set(cerca.id, layer);
      }
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

  /**
   * Controla a mudança do veículo selecionado
   */
  aoMudarVeiculo(): void {
    this.pararSimulacao();
    this.pararGps();
    this.sairModoReplay();
  }

  // ------------------------------------------------------------ Simulação

  /**
   * Inicia a simulação de deslocamento com rota grudada nas ruas (OSRM),
   * caindo para interpolação linear caso o roteamento falhe.
   */
  async iniciarSimulacao(): Promise<void> {
    const veiculoId = this.veiculoSelecionadoId();
    if (!veiculoId) return;

    this.pararSimulacao();
    this.pararGps();
    this.sairModoReplay();

    // Nós de referência da rota em Porto Alegre
    const waypoints: PontoGeo[] = [
      { lat: -30.0346, lng: -51.2177 }, // Centro Histórico
      { lat: -30.0385, lng: -51.2215 }, // Gasômetro / Orla do Guaíba
      { lat: -30.0450, lng: -51.2285 }, // Parque Marinha do Brasil
      { lat: -30.0555, lng: -51.2295 }, // Estádio Beira-Rio
      { lat: -30.0650, lng: -51.2355 }, // Barra Shopping Sul
    ];

    // Obtém a geometria da rota nas ruas; em falha usa o fallback linear.
    this.isCarregandoRota.set(true);
    this.usouFallback.set(false);
    try {
      this.rotaSimuladaPoints = await this.roteamentoService.obterRotaRodoviaria(waypoints);
    } catch (erro) {
      console.warn('Falha no roteamento OSRM; usando interpolação linear.', erro);
      this.usouFallback.set(true);
      this.rotaSimuladaPoints = this.interpolarRota(
        waypoints.map((w) => [w.lat, w.lng] as [number, number]),
        12
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
    const veiculoId = this.veiculoSelecionadoId();
    if (!veiculoId) return;

    this.pararSimulacao();
    this.pararGps();
    this.sairModoReplay();

    if (!navigator.geolocation) {
      alert('Seu navegador não oferece suporte para geolocalização.');
      return;
    }

    this.isGpsAtivo.set(true);

    this.gpsWatchId = navigator.geolocation.watchPosition(
      (posicao) => {
        const { latitude, longitude } = posicao.coords;
        this.rastreamentoService.pushPoint(veiculoId, latitude, longitude);
      },
      (erro) => {
        console.error('Erro na captura da geolocalização:', erro);
        alert(`Erro de geolocalização: ${erro.message}`);
        this.pararGps();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 8000,
      }
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
    const veiculoId = this.veiculoSelecionadoId();
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
    const veiculoId = this.veiculoSelecionadoId();
    if (veiculoId) {
      this.sairModoReplay();
      this.rastreamentoService.limparRota(veiculoId);
    }
  }

  // ------------------------------------------------- Cercas virtuais

  desenharCirculo(): void {
    if (!this.map) return;
    this.map.pm.enableDraw('Circle', { snappable: true });
    this.modoDesenho.set(true);
  }

  desenharPoligono(): void {
    if (!this.map) return;
    this.map.pm.enableDraw('Polygon', { snappable: true });
    this.modoDesenho.set(true);
  }

  cancelarDesenho(): void {
    if (this.map) this.map.pm.disableDraw();
    this.modoDesenho.set(false);
  }

  removerCerca(id: string): void {
    this.cercaService.remover(id);
  }

  limparEventos(): void {
    this.cercaService.limparEventos();
  }

  /**
   * Converte a camada desenhada pelo Geoman em uma CercaVirtual persistida.
   * A camada temporária é descartada; a cerca definitiva é redesenhada pelo effect.
   */
  private aoCriarCerca(evento: any): void {
    const layer = evento.layer;
    const shape = evento.shape;
    this.map.removeLayer(layer);
    this.modoDesenho.set(false);

    const nome = `Cerca ${this.cercaService.listarTodos().length + 1}`;

    if (shape === 'Circle') {
      const centro = layer.getLatLng();
      const raio = layer.getRadius();
      this.cercaService.adicionar({
        nome,
        tipo: 'circulo',
        centro: { lat: centro.lat, lng: centro.lng },
        raio,
        cor: this.corCerca,
      });
    } else if (shape === 'Polygon') {
      const anel = layer.getLatLngs()[0] as L.LatLng[];
      const vertices = anel.map((p) => ({ lat: p.lat, lng: p.lng }));
      this.cercaService.adicionar({ nome, tipo: 'poligono', vertices, cor: this.corCerca });
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
    const pontos = this.pontosDoVeiculo();
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
    const pontos = this.pontosDoVeiculo();
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
