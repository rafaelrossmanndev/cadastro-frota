import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { PontoGeo } from '../models/geo.model';

/** Resposta parcial da API de rotas do OSRM que nos interessa. */
interface RespostaOsrm {
  code: string;
  routes?: {
    geometry: { coordinates: [number, number][] }; // pares [lng, lat]
  }[];
}

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';
const TIMEOUT_MS = 8000;

@Injectable({
  providedIn: 'root',
})
export class RoteamentoService {
  private readonly http = inject(HttpClient);

  /**
   * Consulta o OSRM para obter a geometria da rota que segue as ruas entre os
   * waypoints informados (road snapping). Retorna a lista de pontos [lat, lng]
   * já reamostrada para uma quantidade uniforme, adequada ao playback.
   *
   * Lança erro em caso de falha de rede/timeout/rota inválida — o chamador deve
   * ter um fallback (ex.: interpolação linear).
   */
  async obterRotaRodoviaria(pontos: PontoGeo[], amostras = 70): Promise<[number, number][]> {
    if (pontos.length < 2) {
      throw new Error('São necessários ao menos dois pontos para traçar uma rota.');
    }

    // OSRM espera os pares no formato lng,lat separados por ';'
    const coordenadas = pontos.map((p) => `${p.lng},${p.lat}`).join(';');
    const url = `${OSRM_BASE}/${coordenadas}?overview=full&geometries=geojson`;

    const resposta = await firstValueFrom(
      this.http.get<RespostaOsrm>(url).pipe(timeout(TIMEOUT_MS))
    );

    if (resposta.code !== 'Ok' || !resposta.routes?.length) {
      throw new Error(`OSRM não retornou uma rota válida (code: ${resposta.code}).`);
    }

    // GeoJSON entrega [lng, lat]; invertemos para [lat, lng] usado pelo Leaflet.
    const geometria: [number, number][] = resposta.routes[0].geometry.coordinates.map(
      ([lng, lat]) => [lat, lng]
    );

    return this.reamostrarPorDistancia(geometria, amostras);
  }

  /**
   * Reamostra uma polilinha densa para `n` pontos igualmente espaçados por
   * distância acumulada, garantindo um deslocamento visualmente constante
   * durante a simulação.
   */
  reamostrarPorDistancia(pontos: [number, number][], n: number): [number, number][] {
    if (pontos.length <= 2 || n <= 2) return pontos;

    // Distâncias acumuladas ao longo da polilinha.
    const acumulado: number[] = [0];
    for (let i = 1; i < pontos.length; i++) {
      acumulado.push(acumulado[i - 1] + this.distancia(pontos[i - 1], pontos[i]));
    }

    const total = acumulado[acumulado.length - 1];
    if (total === 0) return pontos;

    const resultado: [number, number][] = [];
    let seg = 0;

    for (let i = 0; i < n; i++) {
      const alvo = (total * i) / (n - 1);

      // Avança até o segmento que contém a distância alvo.
      while (seg < acumulado.length - 2 && acumulado[seg + 1] < alvo) {
        seg++;
      }

      const inicio = pontos[seg];
      const fim = pontos[seg + 1];
      const compSeg = acumulado[seg + 1] - acumulado[seg];
      const t = compSeg === 0 ? 0 : (alvo - acumulado[seg]) / compSeg;

      resultado.push([
        inicio[0] + (fim[0] - inicio[0]) * t,
        inicio[1] + (fim[1] - inicio[1]) * t,
      ]);
    }

    return resultado;
  }

  /** Distância euclidiana simples em graus — suficiente para reamostragem local. */
  private distancia(a: [number, number], b: [number, number]): number {
    const dLat = b[0] - a[0];
    const dLng = b[1] - a[1];
    return Math.sqrt(dLat * dLat + dLng * dLng);
  }
}
