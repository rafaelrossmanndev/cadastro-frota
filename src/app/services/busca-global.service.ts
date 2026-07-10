import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MotoristaService } from './motorista.service';
import { VeiculoService } from './veiculo.service';
import { SelecaoService } from './selecao.service';
import { Motorista } from '../models/motorista.model';
import { VeiculoComMotorista } from '../models/veiculo.model';
import { filtrarMotoristas, filtrarVeiculos } from '../utils/busca.util';

/**
 * Busca unificada (motoristas + veículos) usada pelo header. `resultadosInline`
 * indica se a tela atual (Home) já exibe os resultados na própria sidebar —
 * nesse caso o dropdown flutuante do header não precisa aparecer.
 */
@Injectable({ providedIn: 'root' })
export class BuscaGlobalService {
  private readonly motoristaService = inject(MotoristaService);
  private readonly veiculoService = inject(VeiculoService);
  private readonly selecaoService = inject(SelecaoService);
  private readonly router = inject(Router);

  readonly #termo = signal('');
  readonly #resultadosInline = signal(false);

  readonly termo = this.#termo.asReadonly();
  readonly resultadosInline = this.#resultadosInline.asReadonly();

  definirTermo(valor: string): void {
    this.#termo.set(valor);
  }

  definirResultadosInline(valor: boolean): void {
    this.#resultadosInline.set(valor);
  }

  readonly resultadosMotoristas = computed<Motorista[]>(() => {
    const termo = this.#termo().trim();
    if (!termo) return [];
    return filtrarMotoristas(this.motoristaService.motoristas(), termo);
  });

  readonly resultadosVeiculos = computed<VeiculoComMotorista[]>(() => {
    const termo = this.#termo().trim();
    if (!termo) return [];
    return filtrarVeiculos(this.veiculoService.veiculosComMotorista(), termo);
  });

  selecionarResultado(tipo: 'motorista' | 'veiculo', id: string): void {
    if (tipo === 'motorista') {
      this.selecaoService.selecionarMotorista(id);
    } else {
      this.selecaoService.selecionarVeiculo(id);
    }

    this.#termo.set('');

    if (this.router.url !== '/mapa') {
      this.router.navigate(['/mapa']);
    }
  }
}
