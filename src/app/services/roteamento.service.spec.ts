import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RoteamentoService } from './roteamento.service';

describe('RoteamentoService', () => {
  let service: RoteamentoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RoteamentoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('inverte [lng,lat] do OSRM para [lat,lng]', async () => {
    const promessa = service.obterRotaRodoviaria(
      [
        { lat: -30.0346, lng: -51.2177 },
        { lat: -30.0385, lng: -51.2215 },
      ],
      2
    );

    const req = httpMock.expectOne((r) => r.url.includes('router.project-osrm.org'));
    expect(req.request.method).toBe('GET');
    expect(req.request.urlWithParams).toContain('-51.2177,-30.0346');

    req.flush({
      code: 'Ok',
      routes: [
        {
          geometry: {
            coordinates: [
              [-51.2177, -30.0346],
              [-51.2215, -30.0385],
            ],
          },
        },
      ],
    });

    const pontos = await promessa;
    expect(pontos.length).toBe(2);
    expect(pontos[0]).toEqual([-30.0346, -51.2177]);
    expect(pontos[1]).toEqual([-30.0385, -51.2215]);
  });

  it('rejeita quando o OSRM não retorna rota', async () => {
    const promessa = service.obterRotaRodoviaria([
      { lat: -30, lng: -51 },
      { lat: -31, lng: -52 },
    ]);

    const req = httpMock.expectOne((r) => r.url.includes('router.project-osrm.org'));
    req.flush({ code: 'NoRoute', routes: [] });

    await expectAsync(promessa).toBeRejected();
  });

  describe('reamostrarPorDistancia', () => {
    it('reamostra para N pontos preservando início e fim', () => {
      const linha: [number, number][] = [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
      ];
      const resultado = service.reamostrarPorDistancia(linha, 3);
      expect(resultado.length).toBe(3);
      expect(resultado[0]).toEqual([0, 0]);
      expect(resultado[2]).toEqual([0, 4]);
      expect(resultado[1][1]).toBeCloseTo(2, 5);
    });
  });
});
