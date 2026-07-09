import { Injectable, computed, signal } from '@angular/core';
import { DadosVeiculo, Veiculo, VeiculoComMotorista } from '../models/veiculo.model';
import { MotoristaService } from './motorista.service';
import { gerarCoordenadaAleatoriaPortoAlegre } from '../utils/geo.util';

@Injectable({ providedIn: 'root' })
export class VeiculoService {
  readonly #veiculos = signal<Veiculo[]>([]);

  readonly veiculos = this.#veiculos.asReadonly();

  readonly veiculosComMotorista = computed<VeiculoComMotorista[]>(() =>
    this.#veiculos().map((veiculo) => ({
      ...veiculo,
      nomeMotorista: this.motoristaService.buscarPorId(veiculo.motoristaId)?.nome ?? 'Motorista não encontrado',
    })),
  );

  constructor(private readonly motoristaService: MotoristaService) {
    const [primeiroMotorista, segundoMotorista] = this.motoristaService.listarTodos();

    this.#veiculos.set([
      {
        id: crypto.randomUUID(),
        placa: 'ABC1D23',
        marca: 'Volkswagen',
        modelo: 'Delivery Express',
        anoFabricacao: 2022,
        cor: 'Branco',
        motoristaId: primeiroMotorista.id,
        ...gerarCoordenadaAleatoriaPortoAlegre(),
      },
      {
        id: crypto.randomUUID(),
        placa: 'BRA2E19',
        marca: 'Mercedes-Benz',
        modelo: 'Sprinter',
        anoFabricacao: 2021,
        cor: 'Prata',
        motoristaId: segundoMotorista.id,
        ...gerarCoordenadaAleatoriaPortoAlegre(),
      },
    ]);
  }

  listarTodos(): Veiculo[] {
    return this.#veiculos();
  }

  buscarPorId(id: string): Veiculo | undefined {
    return this.#veiculos().find((veiculo) => veiculo.id === id);
  }

  adicionar(dados: DadosVeiculo): Veiculo {
    const veiculo: Veiculo = { ...dados, id: crypto.randomUUID(), ...gerarCoordenadaAleatoriaPortoAlegre() };
    this.#veiculos.update((veiculos) => [...veiculos, veiculo]);
    return veiculo;
  }

  atualizar(id: string, alteracoes: DadosVeiculo): void {
    this.#veiculos.update((veiculos) =>
      veiculos.map((veiculo) => (veiculo.id === id ? { ...veiculo, ...alteracoes, id } : veiculo)),
    );
  }

  remover(id: string): void {
    this.#veiculos.update((veiculos) => veiculos.filter((veiculo) => veiculo.id !== id));
  }
}
