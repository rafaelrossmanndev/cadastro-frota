import { Injectable, effect, signal } from '@angular/core';

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
  readonly #pontosPorVeiculo = signal<Record<string, Coordenada[]>>(this.carregarHistorico());

  readonly pontosPorVeiculo = this.#pontosPorVeiculo.asReadonly();

  constructor() {
    effect(() => {
      const atual = this.#pontosPorVeiculo();
      try {
        localStorage.setItem(CHAVE_RASTREAMENTO, JSON.stringify(atual));
      } catch (e) {
        console.error('Erro ao salvar histórico de rastreamento', e);
      }
    });
  }

  pushPoint(veiculoId: string, lat: number, lng: number): void {
    if (!veiculoId || isNaN(lat) || isNaN(lng)) return;

    this.#pontosPorVeiculo.update((prev) => {
      const coords = prev[veiculoId] || [];
      const atualizados = [...coords, { lat, lng, timestamp: new Date() }];

      const limitados =
        atualizados.length > MAX_PONTOS_POR_VEICULO
          ? atualizados.slice(atualizados.length - MAX_PONTOS_POR_VEICULO)
          : atualizados;

      return { ...prev, [veiculoId]: limitados };
    });
  }

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
