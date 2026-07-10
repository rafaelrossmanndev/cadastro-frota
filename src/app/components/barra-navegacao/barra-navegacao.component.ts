import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { TemaService } from '../../services/tema.service';
import { ConfirmacaoService } from '../../services/confirmacao.service';
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
  private readonly confirmacaoService = inject(ConfirmacaoService);

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

  /**
   * O ícone do botão de tema é `aria-hidden`, então o modo atual só chega ao
   * leitor de tela pelo nome acessível do botão.
   */
  protected readonly rotuloTema = computed(() => {
    switch (this.temaService.modo()) {
      case 'claro':
        return 'claro';
      case 'escuro':
        return 'escuro';
      default:
        return 'automático';
    }
  });

  definirTema(modo: ModoTema): void {
    this.temaService.definir(modo);
  }

  logout(): void {
    this.confirmacaoService
      .confirmar({
        titulo: 'Sair do sistema',
        mensagem: 'Você precisará entrar novamente para acessar a frota.',
        rotuloConfirmar: 'Sair',
      })
      .subscribe((confirmado) => {
        if (confirmado) {
          this.authService.logout();
        }
      });
  }
}
