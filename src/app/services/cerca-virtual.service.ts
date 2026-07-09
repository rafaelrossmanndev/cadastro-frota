import { Injectable, effect, signal } from '@angular/core';
import {
  CercaVirtual,
  DadosCerca,
  EventoCerca,
  TipoEvento,
} from '../models/cerca-virtual.model';

const CHAVE_CERCAS = 'cadastro-frota-cercas';
const RAIO_TERRA_M = 6371000;
const MAX_EVENTOS = 100;

@Injectable({
  providedIn: 'root',
})
export class CercaVirtualService {
  readonly #cercas = signal<CercaVirtual[]>(this.carregarCercas());
  readonly cercas = this.#cercas.asReadonly();

  readonly #eventos = signal<EventoCerca[]>([]);
  readonly eventos = this.#eventos.asReadonly();

  /**
   * Estado dentro/fora por veículo e cerca ("veiculoId::cercaId" -> dentro?).
   * Transitório: usado apenas para detectar transições de borda em memória.
   */
  private readonly estadoDentro = new Map<string, boolean>();

  constructor() {
    // Persiste as cercas em localStorage sempre que a coleção mudar.
    effect(() => {
      const atuais = this.#cercas();
      try {
        localStorage.setItem(CHAVE_CERCAS, JSON.stringify(atuais));
      } catch (e) {
        console.error('Erro ao salvar cercas virtuais', e);
      }
    });
  }

  // ---------------------------------------------------------------- CRUD

  listarTodos(): CercaVirtual[] {
    return this.#cercas();
  }

  buscarPorId(id: string): CercaVirtual | undefined {
    return this.#cercas().find((c) => c.id === id);
  }

  adicionar(dados: DadosCerca): CercaVirtual {
    const cerca: CercaVirtual = { ...dados, id: crypto.randomUUID() };
    this.#cercas.update((lista) => [...lista, cerca]);
    return cerca;
  }

  atualizar(id: string, alteracoes: Partial<DadosCerca>): void {
    this.#cercas.update((lista) =>
      lista.map((c) => (c.id === id ? { ...c, ...alteracoes, id } : c))
    );
  }

  remover(id: string): void {
    this.#cercas.update((lista) => lista.filter((c) => c.id !== id));
    // Limpa o estado de borda associado a esta cerca.
    for (const chave of [...this.estadoDentro.keys()]) {
      if (chave.endsWith(`::${id}`)) this.estadoDentro.delete(chave);
    }
  }

  limparEventos(): void {
    this.#eventos.set([]);
  }

  // -------------------------------------------------------- Geometria

  /** Retorna true se o ponto (lat, lng) está dentro da cerca. */
  contemPonto(cerca: CercaVirtual, lat: number, lng: number): boolean {
    if (cerca.tipo === 'circulo' && cerca.centro && cerca.raio != null) {
      return this.distanciaHaversine(cerca.centro.lat, cerca.centro.lng, lat, lng) <= cerca.raio;
    }
    if (cerca.tipo === 'poligono' && cerca.vertices && cerca.vertices.length >= 3) {
      return this.pontoEmPoligono(lat, lng, cerca.vertices);
    }
    return false;
  }

  /** Distância em metros entre dois pontos (fórmula de Haversine). */
  distanciaHaversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const rad = (g: number) => (g * Math.PI) / 180;
    const dLat = rad(lat2 - lat1);
    const dLng = rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
    return RAIO_TERRA_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /** Ponto-em-polígono via ray casting. */
  pontoEmPoligono(lat: number, lng: number, vertices: { lat: number; lng: number }[]): boolean {
    let dentro = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const yi = vertices[i].lat;
      const xi = vertices[i].lng;
      const yj = vertices[j].lat;
      const xj = vertices[j].lng;

      const intersecta =
        yi > lat !== yj > lat &&
        lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
      if (intersecta) dentro = !dentro;
    }
    return dentro;
  }

  // ---------------------------------------------------- Detecção

  /**
   * Avalia um novo ponto do veículo contra todas as cercas, registrando eventos
   * de entrada/saída quando há transição de borda. Retorna os eventos gerados.
   */
  avaliarPonto(veiculoId: string, lat: number, lng: number): EventoCerca[] {
    const gerados: EventoCerca[] = [];

    for (const cerca of this.#cercas()) {
      const chave = `${veiculoId}::${cerca.id}`;
      const dentroAgora = this.contemPonto(cerca, lat, lng);
      const dentroAntes = this.estadoDentro.get(chave) ?? false;

      if (dentroAgora !== dentroAntes) {
        // Ignora a "saída" inicial artificial quando nunca houve entrada.
        if (!(dentroAntes === false && dentroAgora === false)) {
          const tipo: TipoEvento = dentroAgora ? 'entrada' : 'saida';
          gerados.push(this.registrarEvento(cerca, veiculoId, tipo, lat, lng));
        }
      }
      this.estadoDentro.set(chave, dentroAgora);
    }

    return gerados;
  }

  private registrarEvento(
    cerca: CercaVirtual,
    veiculoId: string,
    tipo: TipoEvento,
    lat: number,
    lng: number
  ): EventoCerca {
    const evento: EventoCerca = {
      id: crypto.randomUUID(),
      cercaId: cerca.id,
      cercaNome: cerca.nome,
      veiculoId,
      tipo,
      timestamp: new Date(),
      lat,
      lng,
    };
    this.#eventos.update((lista) => [evento, ...lista].slice(0, MAX_EVENTOS));
    return evento;
  }

  // ---------------------------------------------------- Persistência

  private carregarCercas(): CercaVirtual[] {
    try {
      const salvo = localStorage.getItem(CHAVE_CERCAS);
      if (salvo && salvo !== 'null' && salvo !== 'undefined') {
        const cercas = JSON.parse(salvo) as CercaVirtual[];
        if (Array.isArray(cercas)) return cercas;
      }
    } catch (e) {
      console.error('Erro ao carregar cercas virtuais', e);
      localStorage.removeItem(CHAVE_CERCAS);
    }
    return [];
  }
}
