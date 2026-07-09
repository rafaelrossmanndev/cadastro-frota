import { TestBed } from '@angular/core/testing';
import { BrandingService } from './branding.service';
import { MARCA_PADRAO } from '../config/marca.config';

const CHAVE_MARCA = 'cadastro-frota-marca';

describe('BrandingService', () => {
  let service: BrandingService;

  beforeEach(() => {
    localStorage.removeItem(CHAVE_MARCA);
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrandingService);
  });

  it('MARCA_PADRAO fornece as três cores-base', () => {
    expect(MARCA_PADRAO.cores.primaria).toBeTruthy();
    expect(MARCA_PADRAO.cores.sucesso).toBeTruthy();
    expect(MARCA_PADRAO.cores.perigo).toBeTruthy();
  });

  it('aplicar() injeta as cores-base como variáveis CSS e define o título', () => {
    service.aplicar();
    const root = document.documentElement;

    expect(root.style.getPropertyValue('--brand-primary-base')).toBe(MARCA_PADRAO.cores.primaria);
    expect(root.style.getPropertyValue('--brand-sucesso-base')).toBe(MARCA_PADRAO.cores.sucesso);
    expect(root.style.getPropertyValue('--brand-perigo-base')).toBe(MARCA_PADRAO.cores.perigo);
    expect(document.title).toBe(MARCA_PADRAO.nome);
  });

  it('definirMarca() troca a marca ativa e reaplica no DOM', () => {
    service.definirMarca({
      ...MARCA_PADRAO,
      nome: 'Marca Teste',
      cores: { primaria: '#123456', sucesso: '#00aa00', perigo: '#aa0000' },
    });

    expect(service.marca().nome).toBe('Marca Teste');
    expect(document.documentElement.style.getPropertyValue('--brand-primary-base')).toBe('#123456');
    expect(document.title).toBe('Marca Teste');
  });

  it('atualizar() persiste a marca em localStorage', () => {
    service.atualizar({
      ...MARCA_PADRAO,
      nome: 'Persistida',
      cores: { primaria: '#abcdef', sucesso: '#00aa00', perigo: '#aa0000' },
    });

    const salvo = JSON.parse(localStorage.getItem(CHAVE_MARCA)!);
    expect(salvo.nome).toBe('Persistida');
    expect(salvo.cores.primaria).toBe('#abcdef');
  });

  it('restaurar() volta ao padrão e limpa o localStorage', () => {
    service.atualizar({ ...MARCA_PADRAO, nome: 'Temp' });
    service.restaurar();

    expect(service.marca().nome).toBe(MARCA_PADRAO.nome);
    expect(localStorage.getItem(CHAVE_MARCA)).toBeNull();
  });

  it('carrega a marca persistida ao ser instanciado', () => {
    localStorage.setItem(CHAVE_MARCA, JSON.stringify({ ...MARCA_PADRAO, nome: 'Salva Antes' }));

    // Nova instância (novo injetor) deve reidratar do localStorage.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const outra = TestBed.inject(BrandingService);
    expect(outra.marca().nome).toBe('Salva Antes');
  });
});
