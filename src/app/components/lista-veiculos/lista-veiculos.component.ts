import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VeiculoService } from '../../services/veiculo.service';
import { Veiculo } from '../../models/veiculo.model';

@Component({
  selector: 'app-lista-veiculos',
  imports: [RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './lista-veiculos.component.html',
  styleUrl: './lista-veiculos.component.scss',
})
export class ListaVeiculosComponent {
  protected readonly veiculoService = inject(VeiculoService);

  readonly colunasExibidas = ['placa', 'veiculo', 'anoFabricacao', 'cor', 'motorista', 'acoes'];

  removerVeiculo(veiculo: Veiculo): void {
    if (confirm(`Remover o veículo de placa "${veiculo.placa}"?`)) {
      this.veiculoService.remover(veiculo.id);
    }
  }
}
