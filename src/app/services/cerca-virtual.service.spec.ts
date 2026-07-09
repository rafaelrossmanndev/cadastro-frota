import { TestBed } from '@angular/core/testing';
import { CercaVirtualService } from './cerca-virtual.service';
import { CercaVirtual } from '../models/cerca-virtual.model';

describe('CercaVirtualService', () => {
  let service: CercaVirtualService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CercaVirtualService);
  });

  describe('distanciaHaversine', () => {
    it('calcula ~111 km para 1 grau de longitude no equador', () => {
      const d = service.distanciaHaversine(0, 0, 0, 1);
      expect(d).toBeGreaterThan(111000);
      expect(d).toBeLessThan(111500);
    });

    it('retorna 0 para o mesmo ponto', () => {
      expect(service.distanciaHaversine(-30, -51, -30, -51)).toBe(0);
    });
  });

  describe('contemPonto - círculo', () => {
    const circulo: CercaVirtual = {
      id: 'c1',
      nome: 'Zona',
      tipo: 'circulo',
      centro: { lat: -30, lng: -51 },
      raio: 500,
    };

    it('considera o centro dentro', () => {
      expect(service.contemPonto(circulo, -30, -51)).toBeTrue();
    });

    it('considera um ponto distante fora', () => {
      expect(service.contemPonto(circulo, -30.1, -51.1)).toBeFalse();
    });
  });

  describe('contemPonto - polígono (ray casting)', () => {
    const quadrado: CercaVirtual = {
      id: 'p1',
      nome: 'Área',
      tipo: 'poligono',
      vertices: [
        { lat: 0, lng: 0 },
        { lat: 0, lng: 2 },
        { lat: 2, lng: 2 },
        { lat: 2, lng: 0 },
      ],
    };

    it('detecta ponto interno', () => {
      expect(service.contemPonto(quadrado, 1, 1)).toBeTrue();
    });

    it('detecta ponto externo', () => {
      expect(service.contemPonto(quadrado, 3, 3)).toBeFalse();
    });
  });

  describe('avaliarPonto', () => {
    it('gera evento de entrada e depois de saída ao cruzar a borda', () => {
      const cerca = service.adicionar({
        nome: 'Zona',
        tipo: 'circulo',
        centro: { lat: -30, lng: -51 },
        raio: 500,
      });

      // Primeiro ponto fora: não gera evento.
      expect(service.avaliarPonto('v1', -31, -52).length).toBe(0);

      // Entra na cerca.
      const entrada = service.avaliarPonto('v1', -30, -51);
      expect(entrada.length).toBe(1);
      expect(entrada[0].tipo).toBe('entrada');
      expect(entrada[0].cercaId).toBe(cerca.id);

      // Continua dentro: sem novo evento.
      expect(service.avaliarPonto('v1', -30.001, -51).length).toBe(0);

      // Sai da cerca.
      const saida = service.avaliarPonto('v1', -31, -52);
      expect(saida.length).toBe(1);
      expect(saida[0].tipo).toBe('saida');
    });
  });
});
