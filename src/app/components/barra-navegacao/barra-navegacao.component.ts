import { Component, ElementRef, HostListener, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { TemaService } from '../../services/tema.service';
import { BuscaGlobalService } from '../../services/busca-global.service';
import { ModoTema } from '../../models/tema.model';

@Component({
  selector: 'app-barra-navegacao',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './barra-navegacao.component.html',
  styleUrl: './barra-navegacao.component.scss',
})
export class BarraNavegacaoComponent {
  protected readonly authService = inject(AuthService);
  protected readonly temaService = inject(TemaService);
  protected readonly buscaService = inject(BuscaGlobalService);

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  @ViewChild('campoBusca') private readonly campoBusca?: ElementRef<HTMLInputElement>;

  protected readonly buscaAberta = signal(false);

  protected readonly temResultados = computed(
    () => this.buscaService.resultadosMotoristas().length > 0 || this.buscaService.resultadosVeiculos().length > 0,
  );

  /** Ícone do botão de tema conforme o modo atual. */
  protected readonly iconeTema = computed(() => {
    switch (this.temaService.modo()) {
      case 'claro':
        return 'light_mode';
      case 'escuro':
        return 'dark_mode';
      default:
        return 'brightness_auto';
    }
  });

  definirTema(modo: ModoTema): void {
    this.temaService.definir(modo);
  }

  abrirBusca(): void {
    this.buscaAberta.set(true);
    setTimeout(() => this.campoBusca?.nativeElement.focus());
  }

  fecharBusca(): void {
    this.buscaAberta.set(false);
    this.buscaService.definirTermo('');
  }

  aoDigitarBusca(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.buscaService.definirTermo(valor);
  }

  selecionarResultado(tipo: 'motorista' | 'veiculo', id: string): void {
    this.buscaService.selecionarResultado(tipo, id);
    this.fecharBusca();
  }

  @HostListener('document:click', ['$event'])
  protected aoClicarFora(evento: MouseEvent): void {
    if (this.buscaAberta() && !this.elementRef.nativeElement.contains(evento.target as Node)) {
      this.fecharBusca();
    }
  }

  @HostListener('document:keydown.escape')
  protected aoPressionarEscape(): void {
    if (this.buscaAberta()) this.fecharBusca();
  }

  logout(): void {
    if (confirm('Deseja realmente sair do sistema?')) {
      this.authService.logout();
    }
  }
}
