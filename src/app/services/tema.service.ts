import { Injectable, signal } from '@angular/core';
import { ModoTema } from '../models/branding.model';

const CHAVE_TEMA = 'cadastro-frota-tema';

@Injectable({
  providedIn: 'root',
})
export class TemaService {
  readonly #modo = signal<ModoTema>('sistema');
  readonly modo = this.#modo.asReadonly();

  /** Lê a preferência salva e aplica. Chamado no boot. */
  inicializar(): void {
    const salvo = localStorage.getItem(CHAVE_TEMA) as ModoTema | null;
    this.definir(this.ehModoValido(salvo) ? salvo : 'sistema');
  }

  /**
   * Define o tema. 'sistema' segue o SO (remove o atributo);
   * 'claro'/'escuro' forçam o color-scheme via data-theme no <html>.
   */
  definir(modo: ModoTema): void {
    this.#modo.set(modo);

    try {
      localStorage.setItem(CHAVE_TEMA, modo);
    } catch (e) {
      console.error('Erro ao salvar a preferência de tema', e);
    }

    const root = document.documentElement;
    if (modo === 'sistema') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', modo === 'claro' ? 'light' : 'dark');
    }
  }

  private ehModoValido(valor: string | null): valor is ModoTema {
    return valor === 'sistema' || valor === 'claro' || valor === 'escuro';
  }
}
