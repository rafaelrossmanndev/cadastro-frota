import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VeiculoService } from '../../services/veiculo.service';
import { Veiculo, VeiculoComMotorista } from '../../models/veiculo.model';
import { filtrarVeiculos } from '../../utils/busca.util';

@Component({
  selector: 'app-lista-veiculos',
  imports: [RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './lista-veiculos.component.html',
  styleUrl: './lista-veiculos.component.scss',
})
export class ListaVeiculosComponent {
  protected readonly veiculoService = inject(VeiculoService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly colunasExibidas = ['placa', 'veiculo', 'anoFabricacao', 'cor', 'motorista', 'acoes'];

  /** Texto ao vivo (dirige o dropdown de sugestões). */
  protected readonly termoBusca = signal('');
  /** Termo confirmado no Enter/seleção (filtra a tabela). */
  protected readonly termoAplicado = signal('');
  protected readonly dropdownAberto = signal(false);

  /** Sugestões exibidas no dropdown enquanto digita (apenas veículos). */
  protected readonly sugestoes = computed<VeiculoComMotorista[]>(() => {
    const termo = this.termoBusca().trim();
    if (!termo) return [];
    return filtrarVeiculos(this.veiculoService.veiculosComMotorista(), termo);
  });

  /** Lista aplicada à tabela (vazio = todos). */
  protected readonly veiculosFiltrados = computed<VeiculoComMotorista[]>(() =>
    filtrarVeiculos(this.veiculoService.veiculosComMotorista(), this.termoAplicado()),
  );

  aoDigitar(evento: Event): void {
    this.termoBusca.set((evento.target as HTMLInputElement).value);
    this.dropdownAberto.set(true);
  }

  aplicarBusca(): void {
    this.termoAplicado.set(this.termoBusca());
    this.dropdownAberto.set(false);
  }

  selecionarSugestao(veiculo: VeiculoComMotorista): void {
    const termo = veiculo.placa;
    this.termoBusca.set(termo);
    this.termoAplicado.set(termo);
    this.dropdownAberto.set(false);
  }

  limparBusca(): void {
    this.termoBusca.set('');
    this.termoAplicado.set('');
    this.dropdownAberto.set(false);
  }

  @HostListener('document:click', ['$event'])
  protected aoClicarFora(evento: MouseEvent): void {
    if (this.dropdownAberto() && !this.elementRef.nativeElement.contains(evento.target as Node)) {
      this.dropdownAberto.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected aoPressionarEscape(): void {
    if (this.dropdownAberto()) this.dropdownAberto.set(false);
  }

  removerVeiculo(veiculo: Veiculo): void {
    if (confirm(`Remover o veículo de placa "${veiculo.placa}"?`)) {
      this.veiculoService.remover(veiculo.id);
    }
  }
}
