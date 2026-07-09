import { Injectable, signal } from '@angular/core';
import { Marca } from '../models/branding.model';
import { MARCA_PADRAO } from '../config/marca.config';

const CHAVE_MARCA = 'cadastro-frota-marca';

@Injectable({
  providedIn: 'root',
})
export class BrandingService {
  readonly #marca = signal<Marca>(this.carregar());
  readonly marca = this.#marca.asReadonly();

  /**
   * Aplica a marca ativa: injeta as cores-base como variáveis CSS (o resto dos
   * tons é derivado em styles.scss), define o título da aba e o favicon.
   * Chamado no boot via provideAppInitializer.
   */
  aplicar(): void {
    const marca = this.#marca();
    const root = document.documentElement;

    root.style.setProperty('--brand-primary-base', marca.cores.primaria);
    root.style.setProperty('--brand-sucesso-base', marca.cores.sucesso);
    root.style.setProperty('--brand-perigo-base', marca.cores.perigo);

    document.title = marca.nome;

    if (marca.faviconUrl) {
      this.definirFavicon(marca.faviconUrl);
    }
  }

  /** Troca a marca ativa em runtime sem persistir (útil para preview/testes). */
  definirMarca(marca: Marca): void {
    this.#marca.set(marca);
    this.aplicar();
  }

  /** Atualiza a marca ativa, PERSISTE em localStorage e reaplica. */
  atualizar(marca: Marca): void {
    this.definirMarca(marca);
    this.persistir(marca);
  }

  /** Restaura a marca de fábrica (MARCA_PADRAO) e limpa a personalização salva. */
  restaurar(): void {
    try {
      localStorage.removeItem(CHAVE_MARCA);
    } catch (e) {
      console.error('Erro ao remover a personalização salva', e);
    }
    this.definirMarca(MARCA_PADRAO);
  }

  private definirFavicon(href: string): void {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = href;
  }

  private carregar(): Marca {
    try {
      const salvo = localStorage.getItem(CHAVE_MARCA);
      if (salvo && salvo !== 'null' && salvo !== 'undefined') {
        const parcial = JSON.parse(salvo) as Partial<Marca>;
        // Mescla sobre o padrão para tolerar marcas salvas incompletas.
        return {
          ...MARCA_PADRAO,
          ...parcial,
          cores: { ...MARCA_PADRAO.cores, ...(parcial.cores ?? {}) },
        };
      }
    } catch (e) {
      console.error('Erro ao carregar a personalização da marca', e);
      localStorage.removeItem(CHAVE_MARCA);
    }
    return MARCA_PADRAO;
  }

  private persistir(marca: Marca): void {
    try {
      localStorage.setItem(CHAVE_MARCA, JSON.stringify(marca));
    } catch (e) {
      console.error('Erro ao salvar a personalização da marca', e);
    }
  }
}
