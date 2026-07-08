import { Injectable, signal } from '@angular/core';

export interface Coordenada {
  lat: number;
  lng: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class RastreamentoService {
  // Estado privado usando signal
  readonly #pontosPorVeiculo = signal<Record<string, Coordenada[]>>({});

  // Sinal somente leitura público
  readonly pontosPorVeiculo = this.#pontosPorVeiculo.asReadonly();

  /**
   * Único ponto de entrada para registrar novas coordenadas de rastreamento.
   * Aceita chamadas de qualquer origem: simulação, manual ou GPS do dispositivo.
   */
  pushPoint(veiculoId: string, lat: number, lng: number): void {
    if (!veiculoId || isNaN(lat) || isNaN(lng)) return;

    this.#pontosPorVeiculo.update((prev) => {
      const coords = prev[veiculoId] || [];
      return {
        ...prev,
        [veiculoId]: [
          ...coords,
          {
            lat,
            lng,
            timestamp: new Date(),
          },
        ],
      };
    });
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
}
