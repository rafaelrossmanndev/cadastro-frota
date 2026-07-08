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

import * as L from 'leaflet';

import { VeiculoService } from '../../services/veiculo.service';
import { RastreamentoService, Coordenada } from '../../services/rastreamento.service';

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
  ],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.scss',
})
export class MapaComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  protected readonly veiculoService = inject(VeiculoService);
  protected readonly rastreamentoService = inject(RastreamentoService);
  private readonly router = inject(Router);

  // Sinais de controle
  readonly veiculoSelecionadoId = signal<string>('');
  readonly isSimulando = signal(false);
  readonly isGpsAtivo = signal(false);
  readonly latManual = signal<number | null>(null);
  readonly lngManual = signal<number | null>(null);

  // Referências do Leaflet
  private map!: L.Map;
  private marker?: L.Marker;
  private polyline?: L.Polyline;

  // Variáveis da simulação
  private simularIntervalId?: any;
  private rotaSimuladaPoints: [number, number][] = [];
  private indexSimulacao = 0;

  // Variável do GPS
  private gpsWatchId?: number;

  constructor() {
    // Efeito para redesenhar a rota quando o veículo selecionado mudar ou novas coordenadas forem inseridas
    effect(() => {
      const veiculoId = this.veiculoSelecionadoId();
      if (!veiculoId) {
        this.limparCamadasMapa();
        return;
      }

      const pontos = this.rastreamentoService.pontosPorVeiculo()[veiculoId] || [];
      this.desenharRota(pontos);
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
  }

  ngOnDestroy(): void {
    this.pararSimulacao();
    this.pararGps();
    
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
   * Executa a renderização reativa do trajeto e marcador
   */
  private desenharRota(pontos: Coordenada[]): void {
    if (!this.map) return;

    // Limpar polyline anterior se houver
    if (this.polyline) {
      this.polyline.remove();
      this.polyline = undefined;
    }

    // Desenha a polyline tracejada se tivermos 2 ou mais pontos
    if (pontos.length >= 2) {
      const latlngs = pontos.map((p) => [p.lat, p.lng] as L.LatLngExpression);
      this.polyline = L.polyline(latlngs, {
        color: '#2e6ef5',
        dashArray: '8, 8',
        weight: 4,
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

        this.marker = L.marker(novaPosicao, { icon: iconeCustomizado }).addTo(this.map);
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
   * Limpa todos os elementos visuais do mapa
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
  }

  /**
   * Inicia a simulação de deslocamento
   */
  iniciarSimulacao(): void {
    const veiculoId = this.veiculoSelecionadoId();
    if (!veiculoId) return;

    this.pararSimulacao();
    this.pararGps();

    // Nós de referência da rota em Porto Alegre
    const waypoints: [number, number][] = [
      [-30.0346, -51.2177], // Centro Histórico
      [-30.0385, -51.2215], // Gasômetro / Orla do Guaíba
      [-30.0450, -51.2285], // Parque Marinha do Brasil
      [-30.0555, -51.2295], // Estádio Beira-Rio
      [-30.0650, -51.2355], // Barra Shopping Sul
    ];

    // Gerar pontos intermediários interpolados para um movimento fluido
    this.rotaSimuladaPoints = this.interpolarRota(waypoints, 12);
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
    }, 1200);
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

  /**
   * Inicia o rastreamento via GPS do dispositivo
   */
  iniciarGps(): void {
    const veiculoId = this.veiculoSelecionadoId();
    if (!veiculoId) return;

    this.pararSimulacao();
    this.pararGps();

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
      this.rastreamentoService.limparRota(veiculoId);
    }
  }

  /**
   * Interpolação linear simples para suavizar o percurso da simulação
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
