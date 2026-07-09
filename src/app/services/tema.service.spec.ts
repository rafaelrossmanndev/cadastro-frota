import { TestBed } from '@angular/core/testing';
import { TemaService } from './tema.service';

const CHAVE_TEMA = 'cadastro-frota-tema';

describe('TemaService', () => {
  let service: TemaService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemaService);
  });

  it('definir("escuro") força data-theme=dark e persiste', () => {
    service.definir('escuro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(CHAVE_TEMA)).toBe('escuro');
    expect(service.modo()).toBe('escuro');
  });

  it('definir("claro") força data-theme=light', () => {
    service.definir('claro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(service.modo()).toBe('claro');
  });

  it('definir("sistema") remove o atributo data-theme', () => {
    service.definir('escuro');
    service.definir('sistema');
    expect(document.documentElement.hasAttribute('data-theme')).toBeFalse();
    expect(localStorage.getItem(CHAVE_TEMA)).toBe('sistema');
    expect(service.modo()).toBe('sistema');
  });

  it('inicializar() aplica a preferência salva', () => {
    localStorage.setItem(CHAVE_TEMA, 'escuro');
    service.inicializar();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(service.modo()).toBe('escuro');
  });

  it('inicializar() cai para "sistema" quando o valor salvo é inválido', () => {
    localStorage.setItem(CHAVE_TEMA, 'valor-invalido');
    service.inicializar();
    expect(document.documentElement.hasAttribute('data-theme')).toBeFalse();
    expect(service.modo()).toBe('sistema');
  });
});
