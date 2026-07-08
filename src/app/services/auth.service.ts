import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { UsuarioAutenticado } from '../models/auth.model';

const CHAVE_SESSAO = 'cadastro-frota-sessao';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);

  readonly #usuarioLogado = signal<UsuarioAutenticado | null>(null);

  readonly usuarioLogado = this.#usuarioLogado.asReadonly();
  readonly isAuthenticated = computed(() => this.#usuarioLogado() !== null);

  constructor() {
    this.carregarSessao();
  }

  login(usuario: string, senha: string): Observable<boolean> {
    // Simula validação com atraso de rede
    const sucesso = usuario.trim().toLowerCase() === 'admin' && senha === 'admin123';

    return of(sucesso).pipe(
      delay(1200),
      tap((isOk) => {
        if (isOk) {
          const usuarioMock: UsuarioAutenticado = {
            id: 'mock-user-id',
            nome: 'Administrador White Label',
            usuario: 'admin',
            email: 'admin@suaempresa.com.br',
            cargo: 'Gerente de Operações',
          };
          this.#usuarioLogado.set(usuarioMock);
          localStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuarioMock));
        }
      })
    );
  }

  logout(): void {
    this.#usuarioLogado.set(null);
    localStorage.removeItem(CHAVE_SESSAO);
    this.router.navigate(['/login']);
  }

  private carregarSessao(): void {
    try {
      const sessaoSalva = localStorage.getItem(CHAVE_SESSAO);
      if (sessaoSalva) {
        const usuario: UsuarioAutenticado = JSON.parse(sessaoSalva);
        this.#usuarioLogado.set(usuario);
      }
    } catch (e) {
      console.error('Erro ao carregar sessão', e);
      localStorage.removeItem(CHAVE_SESSAO);
    }
  }
}
