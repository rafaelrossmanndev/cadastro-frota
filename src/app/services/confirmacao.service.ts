import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {
  DadosDialogoConfirmacao,
  DialogoConfirmacaoComponent,
} from '../components/dialogo-confirmacao/dialogo-confirmacao.component';

@Injectable({ providedIn: 'root' })
export class ConfirmacaoService {
  private readonly dialog = inject(MatDialog);

  confirmar(dados: DadosDialogoConfirmacao): Observable<boolean | undefined> {
    return this.dialog
      .open<DialogoConfirmacaoComponent, DadosDialogoConfirmacao, boolean>(
        DialogoConfirmacaoComponent,
        {
          data: dados,
          width: '420px',
          maxWidth: 'calc(100vw - 32px)',
          autoFocus: 'dialog',
          restoreFocus: true,
        },
      )
      .afterClosed();
  }
}
