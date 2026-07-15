import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface DadosDialogoConfirmacao {
  titulo: string;
  mensagem: string;
  rotuloConfirmar: string;
  perigo?: boolean;
}

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
