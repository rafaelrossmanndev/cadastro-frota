export type TipoCerca = 'circulo' | 'poligono';

export interface PontoGeo {
  lat: number;
  lng: number;
}

export interface CercaVirtual {
  readonly id: string;
  nome: string;
  tipo: TipoCerca;
  cor?: string;
  /** Preenchidos quando tipo === 'circulo' */
  centro?: PontoGeo;
  raio?: number; // metros
  /** Preenchidos quando tipo === 'poligono' */
  vertices?: PontoGeo[];
}

export type DadosCerca = Omit<CercaVirtual, 'id'>;

export type TipoEvento = 'entrada' | 'saida';

export interface EventoCerca {
  readonly id: string;
  cercaId: string;
  cercaNome: string;
  veiculoId: string;
  tipo: TipoEvento;
  timestamp: Date;
  lat: number;
  lng: number;
}
