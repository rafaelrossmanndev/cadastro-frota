import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { VeiculoService } from '../../services/veiculo.service';
import { MotoristaService } from '../../services/motorista.service';
import { Veiculo } from '../../models/veiculo.model';

interface LinhaVeiculo extends Veiculo {
  nomeMotorista: string;
}

@Component({
  selector: 'app-lista-veiculos',
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './lista-veiculos.component.html',
  styleUrl: './lista-veiculos.component.scss',
})
export class ListaVeiculosComponent {
  private readonly veiculoService = inject(VeiculoService);
  private readonly motoristaService = inject(MotoristaService);

  readonly termoBusca = signal('');

  readonly linhas = computed<LinhaVeiculo[]>(() =>
    this.veiculoService.veiculos().map((veiculo) => ({
      ...veiculo,
      nomeMotorista: this.motoristaService.buscarPorId(veiculo.motoristaId)?.nome ?? 'Motorista não encontrado',
    })),
  );

  readonly linhasFiltradas = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();

    if (!termo) {
      return this.linhas();
    }

    const termoPlaca = termo.toUpperCase().replace(/[^A-Z0-9]/g, '');

    return this.linhas().filter((linha) => {
      const nomeVeiculo = `${linha.marca} ${linha.modelo}`.toLowerCase();
      const nomeMotoristaCorresponde = linha.nomeMotorista.toLowerCase().includes(termo);
      const placaCorresponde = termoPlaca.length > 0 && linha.placa.includes(termoPlaca);
      return nomeVeiculo.includes(termo) || nomeMotoristaCorresponde || placaCorresponde;
    });
  });

  readonly colunasExibidas = ['placa', 'veiculo', 'anoFabricacao', 'cor', 'motorista', 'acoes'];

  aoDigitarBusca(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.termoBusca.set(valor);
  }

  removerVeiculo(veiculo: Veiculo): void {
    if (confirm(`Remover o veículo de placa "${veiculo.placa}"?`)) {
      this.veiculoService.remover(veiculo.id);
    }
  }
}
