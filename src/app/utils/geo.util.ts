import { PontoGeo } from '../models/geo.model';

export const PONTOS_REFERENCIA_POA: PontoGeo[] = [
  { lat: -30.0346, lng: -51.2177 },
  { lat: -30.0385, lng: -51.2215 },
  { lat: -30.045, lng: -51.2285 },
  { lat: -30.0555, lng: -51.2295 },
  { lat: -30.065, lng: -51.2355 },
];

const OFFSET_MAXIMO_GRAUS = 0.02;

export function gerarCoordenadaAleatoriaPortoAlegre(): PontoGeo {
  const base = PONTOS_REFERENCIA_POA[Math.floor(Math.random() * PONTOS_REFERENCIA_POA.length)];
  const desvio = () => (Math.random() * 2 - 1) * OFFSET_MAXIMO_GRAUS;

  return {
    lat: base.lat + desvio(),
    lng: base.lng + desvio(),
  };
}
