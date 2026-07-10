import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

/** Texto de uma confirmação. `perigo` pinta a ação de vermelho semântico. */
export interface DadosDialogoConfirmacao {
  titulo: string;
  mensagem: string;
  rotuloConfirmar: string;
  perigo?: boolean;
}

/**
 * Confirmação de ação destrutiva. Substitui o `confirm()` nativo, que rompe a
 * identidade visual exatamente no momento mais tenso do fluxo.
 *
 * O foco inicial vai para "Cancelar", não para a ação destrutiva: um Enter
 * apressado não pode apagar um cadastro.
 */
@Component({
  selector: 'app-dialogo-confirmacao',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './dialogo-confirmacao.component.html',
  styleUrl: './dialogo-confirmacao.component.scss',
})
export class DialogoConfirmacaoComponent {
  protected readonly dados = inject<DadosDialogoConfirmacao>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DialogoConfirmacaoComponent, boolean>);

  confirmar(): void {
    this.dialogRef.close(true);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
