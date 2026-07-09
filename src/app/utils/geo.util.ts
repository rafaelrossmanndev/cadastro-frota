import { PontoGeo } from '../models/geo.model';

/** Pontos de referência conhecidos e verificados em terra, em Porto Alegre. */
export const PONTOS_REFERENCIA_POA: PontoGeo[] = [
  { lat: -30.0346, lng: -51.2177 }, // Centro Histórico
  { lat: -30.0385, lng: -51.2215 }, // Gasômetro / Orla do Guaíba
  { lat: -30.045, lng: -51.2285 }, // Parque Marinha do Brasil
  { lat: -30.0555, lng: -51.2295 }, // Estádio Beira-Rio
  { lat: -30.065, lng: -51.2355 }, // Barra Shopping Sul
];

const OFFSET_MAXIMO_GRAUS = 0.02;

/**
 * Gera uma coordenada aleatória em Porto Alegre, aplicando um pequeno desvio
 * a um ponto de referência conhecido (evita cair no meio do Guaíba, cuja
 * margem é irregular demais para um retângulo de bounding box simples).
 */
export function gerarCoordenadaAleatoriaPortoAlegre(): PontoGeo {
  const base = PONTOS_REFERENCIA_POA[Math.floor(Math.random() * PONTOS_REFERENCIA_POA.length)];
  const desvio = () => (Math.random() * 2 - 1) * OFFSET_MAXIMO_GRAUS;

  return {
    lat: base.lat + desvio(),
    lng: base.lng + desvio(),
  };
}
