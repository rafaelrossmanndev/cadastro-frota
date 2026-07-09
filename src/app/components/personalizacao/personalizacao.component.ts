import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { BrandingService } from '../../services/branding.service';
import { TemaService } from '../../services/tema.service';
import { Marca, ModoTema } from '../../models/branding.model';
import { MARCA_PADRAO } from '../../config/marca.config';

const TAMANHO_MAX_ARQUIVO = 1_500_000; // ~1.5 MB (localStorage é limitado)

@Component({
  selector: 'app-personalizacao',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './personalizacao.component.html',
  styleUrl: './personalizacao.component.scss',
})
export class PersonalizacaoComponent {
  private readonly brandingService = inject(BrandingService);
  protected readonly temaService = inject(TemaService);
  private readonly snackBar = inject(MatSnackBar);

  // Cópia editável dos campos da marca
  readonly nome = signal('');
  readonly nomeCurto = signal('');
  readonly loginTitulo = signal('');
  readonly tagline = signal('');
  readonly iconeFallback = signal('directions_car');
  readonly corPrimaria = signal('#2e6ef5');
  readonly corSucesso = signal('#26a269');
  readonly corPerigo = signal('#e5484d');
  readonly logoUrl = signal<string | null>(null);
  readonly faviconUrl = signal<string | undefined>(undefined);

  constructor() {
    this.carregarDaMarca(this.brandingService.marca());
  }

  private carregarDaMarca(m: Marca): void {
    this.nome.set(m.nome);
    this.nomeCurto.set(m.nomeCurto ?? '');
    this.loginTitulo.set(m.loginTitulo ?? '');
    this.tagline.set(m.tagline);
    this.iconeFallback.set(m.iconeFallback ?? 'directions_car');
    this.corPrimaria.set(m.cores.primaria);
    this.corSucesso.set(m.cores.sucesso);
    this.corPerigo.set(m.cores.perigo);
    this.logoUrl.set(m.logoUrl);
    this.faviconUrl.set(m.faviconUrl);
  }

  aoSelecionarLogo(evento: Event): void {
    this.lerArquivo(evento, (dataUrl) => this.logoUrl.set(dataUrl));
  }

  removerLogo(): void {
    this.logoUrl.set(null);
  }

  aoSelecionarFavicon(evento: Event): void {
    this.lerArquivo(evento, (dataUrl) => this.faviconUrl.set(dataUrl));
  }

  removerFavicon(): void {
    this.faviconUrl.set(undefined);
  }

  definirTema(modo: ModoTema): void {
    this.temaService.definir(modo);
  }

  salvar(): void {
    const marca: Marca = {
      nome: this.nome().trim() || MARCA_PADRAO.nome,
      nomeCurto: this.nomeCurto().trim() || undefined,
      logoUrl: this.logoUrl(),
      iconeFallback: this.iconeFallback().trim() || 'directions_car',
      faviconUrl: this.faviconUrl(),
      tagline: this.tagline().trim(),
      loginTitulo: this.loginTitulo().trim() || undefined,
      cores: {
        primaria: this.corPrimaria(),
        sucesso: this.corSucesso(),
        perigo: this.corPerigo(),
      },
    };

    this.brandingService.atualizar(marca);
    this.snackBar.open('Personalização salva!', 'Fechar', { duration: 3000 });
  }

  restaurar(): void {
    if (!confirm('Restaurar a identidade visual padrão? A personalização atual será perdida.')) {
      return;
    }
    this.brandingService.restaurar();
    this.carregarDaMarca(this.brandingService.marca());
    this.snackBar.open('Identidade visual padrão restaurada.', 'Fechar', { duration: 3000 });
  }

  private lerArquivo(evento: Event, aoLer: (dataUrl: string) => void): void {
    const input = evento.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) return;

    if (arquivo.size > TAMANHO_MAX_ARQUIVO) {
      this.snackBar.open('Imagem muito grande (máx. 1,5 MB).', 'Fechar', { duration: 4000 });
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => aoLer(reader.result as string);
    reader.readAsDataURL(arquivo);
    input.value = '';
  }
}
