import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { BrandingService } from '../../services/branding.service';
import { TemaService } from '../../services/tema.service';
import { ModoTema } from '../../models/branding.model';

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
  protected readonly brandingService = inject(BrandingService);
  protected readonly temaService = inject(TemaService);

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

  logout(): void {
    if (confirm('Deseja realmente sair do sistema?')) {
      this.authService.logout();
    }
  }
}
