import { Injectable, inject, signal } from '@angular/core';
import { VeiculoService } from './veiculo.service';

/**
 * Estado de seleção compartilhado entre o header (busca) e a tela Home
 * (clique em marcador do mapa / lista padrão da sidebar).
 */
@Injectable({ providedIn: 'root' })
export class SelecaoService {
  private readonly veiculoService = inject(VeiculoService);

  readonly #veiculoSelecionadoId = signal<string | null>(null);
  readonly #motoristaSemVeiculoId = signal<string | null>(null);

  readonly veiculoSelecionadoId = this.#veiculoSelecionadoId.asReadonly();
  readonly motoristaSemVeiculoId = this.#motoristaSemVeiculoId.asReadonly();

  selecionarVeiculo(id: string): void {
    this.#veiculoSelecionadoId.set(id);
    this.#motoristaSemVeiculoId.set(null);
  }

  /** Resolve o motorista ao seu veículo (primeiro encontrado); sem veículo, mostra só os dados do motorista. */
  selecionarMotorista(motoristaId: string): void {
    const veiculo = this.veiculoService.listarTodos().find((v) => v.motoristaId === motoristaId);

    if (veiculo) {
      this.selecionarVeiculo(veiculo.id);
    } else {
      this.#veiculoSelecionadoId.set(null);
      this.#motoristaSemVeiculoId.set(motoristaId);
    }
  }

  limpar(): void {
    this.#veiculoSelecionadoId.set(null);
    this.#motoristaSemVeiculoId.set(null);
  }
}
