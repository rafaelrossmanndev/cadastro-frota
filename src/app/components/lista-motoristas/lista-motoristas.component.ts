import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MotoristaService } from '../../services/motorista.service';
import { Motorista } from '../../models/motorista.model';

@Component({
  selector: 'app-lista-motoristas',
  imports: [
    RouterLink,
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './lista-motoristas.component.html',
  styleUrl: './lista-motoristas.component.scss',
})
export class ListaMotoristasComponent {
  private readonly motoristaService = inject(MotoristaService);

  readonly termoBusca = signal('');

  readonly motoristasFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();

    if (!termo) {
      return this.motoristaService.motoristas();
    }

    const termoCpf = termo.replace(/\D/g, '');

    return this.motoristaService.motoristas().filter((motorista) => {
      const nomeCorresponde = motorista.nome.toLowerCase().includes(termo);
      const cpfCorresponde = termoCpf.length > 0 && motorista.cpf.includes(termoCpf);
      return nomeCorresponde || cpfCorresponde;
    });
  });

  readonly colunasExibidas = ['nome', 'cpf', 'cnh', 'validadeCnh', 'contato', 'acoes'];

  aoDigitarBusca(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.termoBusca.set(valor);
  }

  formatarCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  cnhVencida(motorista: Motorista): boolean {
    return motorista.validadeCnh.getTime() < new Date().setHours(0, 0, 0, 0);
  }

  removerMotorista(motorista: Motorista): void {
    if (confirm(`Remover o motorista "${motorista.nome}"?`)) {
      this.motoristaService.remover(motorista.id);
    }
  }
}
