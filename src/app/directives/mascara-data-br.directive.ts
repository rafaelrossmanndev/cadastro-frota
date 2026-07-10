import { Directive, HostListener } from '@angular/core';

/**
 * Máscara de digitação para datas no padrão brasileiro (DD/MM/AAAA): mantém
 * apenas dígitos (máx. 8) e insere as barras progressivamente enquanto o
 * usuário digita. Não é ControlValueAccessor — evita conflito com o
 * `MatDatepickerInput` (que continua parseando o valor formatado).
 */
@Directive({
  selector: '[appMascaraDataBr]',
  standalone: true,
})
export class MascaraDataBrDirective {
  @HostListener('input', ['$event'])
  aoDigitar(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const digitos = input.value.replace(/\D/g, '').slice(0, 8);

    let formatado = digitos;
    if (digitos.length > 4) {
      formatado = `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
    } else if (digitos.length > 2) {
      formatado = `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
    }

    if (formatado !== input.value) {
      input.value = formatado;
    }
  }
}
