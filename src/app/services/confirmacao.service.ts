import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {
  DadosDialogoConfirmacao,
  DialogoConfirmacaoComponent,
} from '../components/dialogo-confirmacao/dialogo-confirmacao.component';

/**
 * Ponto único de confirmação de ações. Centraliza aqui para que nenhuma tela
 * volte a chamar `confirm()` nativo, e para que largura, foco inicial e
 * comportamento de Escape sejam iguais em todo o app.
 */
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
