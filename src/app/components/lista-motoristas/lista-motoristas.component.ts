import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MotoristaService } from '../../services/motorista.service';
import { ConfirmacaoService } from '../../services/confirmacao.service';
import { Motorista } from '../../models/motorista.model';
import { filtrarMotoristas } from '../../utils/busca.util';

@Component({
  selector: 'app-lista-motoristas',
  imports: [RouterLink, DatePipe, MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './lista-motoristas.component.html',
  styleUrl: './lista-motoristas.component.scss',
})
export class ListaMotoristasComponent {
  protected readonly motoristaService = inject(MotoristaService);
  private readonly confirmacaoService = inject(ConfirmacaoService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly colunasExibidas = ['nome', 'cpf', 'cnh', 'validadeCnh', 'contato', 'acoes'];

  /** Texto ao vivo (dirige o dropdown de sugestões). */
  protected readonly termoBusca = signal('');
  /** Termo confirmado no Enter/seleção (filtra a tabela). */
  protected readonly termoAplicado = signal('');
  protected readonly dropdownAberto = signal(false);

  /** Sugestões exibidas no dropdown enquanto digita (apenas motoristas). */
  protected readonly sugestoes = computed<Motorista[]>(() => {
    const termo = this.termoBusca().trim();
    if (!termo) return [];
    return filtrarMotoristas(this.motoristaService.motoristas(), termo);
  });

  /** Lista aplicada à tabela (vazio = todos). */
  protected readonly motoristasFiltrados = computed<Motorista[]>(() =>
    filtrarMotoristas(this.motoristaService.motoristas(), this.termoAplicado()),
  );

  aoDigitar(evento: Event): void {
    this.termoBusca.set((evento.target as HTMLInputElement).value);
    this.dropdownAberto.set(true);
  }

  aplicarBusca(): void {
    this.termoAplicado.set(this.termoBusca());
    this.dropdownAberto.set(false);
  }

  selecionarSugestao(motorista: Motorista): void {
    this.termoBusca.set(motorista.nome);
    this.termoAplicado.set(motorista.nome);
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

  formatarCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  cnhVencida(motorista: Motorista): boolean {
    return motorista.validadeCnh.getTime() < new Date().setHours(0, 0, 0, 0);
  }

  removerMotorista(motorista: Motorista): void {
    this.confirmacaoService
      .confirmar({
        titulo: 'Remover motorista',
        mensagem: `${motorista.nome} será removido do cadastro. Esta ação não pode ser desfeita.`,
        rotuloConfirmar: 'Remover',
        perigo: true,
      })
      .subscribe((confirmado) => {
        if (confirmado) {
          this.motoristaService.remover(motorista.id);
        }
      });
  }
}
