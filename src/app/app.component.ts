import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarraNavegacaoComponent } from './components/barra-navegacao/barra-navegacao.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BarraNavegacaoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly authService = inject(AuthService);
}

