import { Injectable, effect, inject, signal } from '@angular/core';
import { CercaVirtualService } from './cerca-virtual.service';

export interface Coordenada {
  lat: number;
  lng: number;
  timestamp: Date;
}

const CHAVE_RASTREAMENTO = 'cadastro-frota-rastreamento';
const MAX_PONTOS_POR_VEICULO = 500;

@Injectable({
  providedIn: 'root',
})
export class RastreamentoService {
  private readonly cercaService = inject(CercaVirtualService);

  // Estado privado usando signal
  readonly #pontosPorVeiculo = signal<Record<string, Coordenada[]>>(this.carregarHistorico());

  // Sinal somente leitura público
  readonly pontosPorVeiculo = this.#pontosPorVeiculo.asReadonly();

  constructor() {
    // Persiste o histórico em localStorage sempre que houver alteração.
    effect(() => {
      const atual = this.#pontosPorVeiculo();
      try {
        localStorage.setItem(CHAVE_RASTREAMENTO, JSON.stringify(atual));
      } catch (e) {
        console.error('Erro ao salvar histórico de rastreamento', e);
      }
    });
  }

  /**
   * Único ponto de entrada para registrar novas coordenadas de rastreamento.
   * Aceita chamadas de qualquer origem: simulação, manual ou GPS do dispositivo.
   * Também avalia as cercas virtuais para disparar eventos de entrada/saída.
   */
  pushPoint(veiculoId: string, lat: number, lng: number): void {
    if (!veiculoId || isNaN(lat) || isNaN(lng)) return;

    this.#pontosPorVeiculo.update((prev) => {
      const coords = prev[veiculoId] || [];
      const atualizados = [...coords, { lat, lng, timestamp: new Date() }];
      // Mantém apenas os últimos N pontos para não crescer indefinidamente.
      const limitados =
        atualizados.length > MAX_PONTOS_POR_VEICULO
          ? atualizados.slice(atualizados.length - MAX_PONTOS_POR_VEICULO)
          : atualizados;
      return { ...prev, [veiculoId]: limitados };
    });

    // Detecção de cercas virtuais (geofencing).
    this.cercaService.avaliarPonto(veiculoId, lat, lng);
  }

  /**
   * Limpa a rota tracejada do veículo, mantendo apenas a última posição
   * conhecida para que o marcador continue visível no mapa.
   */
  limparRota(veiculoId: string): void {
    if (!veiculoId) return;

    this.#pontosPorVeiculo.update((prev) => {
      const coords = prev[veiculoId] || [];
      if (coords.length === 0) return prev;

      const ultimoPonto = coords[coords.length - 1];
      return {
        ...prev,
        [veiculoId]: [ultimoPonto],
      };
    });
  }

  private carregarHistorico(): Record<string, Coordenada[]> {
    try {
      const salvo = localStorage.getItem(CHAVE_RASTREAMENTO);
      if (salvo && salvo !== 'null' && salvo !== 'undefined') {
        const bruto = JSON.parse(salvo) as Record<string, Coordenada[]>;
        // Revive os timestamps (serializados como string) de volta para Date.
        const revivido: Record<string, Coordenada[]> = {};
        for (const [veiculoId, coords] of Object.entries(bruto)) {
          revivido[veiculoId] = coords.map((c) => ({
            lat: c.lat,
            lng: c.lng,
            timestamp: new Date(c.timestamp),
          }));
        }
        return revivido;
      }
    } catch (e) {
      console.error('Erro ao carregar histórico de rastreamento', e);
      localStorage.removeItem(CHAVE_RASTREAMENTO);
    }
    return {};
  }
}
