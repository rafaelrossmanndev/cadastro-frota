import { AbstractControl, ValidationErrors } from '@angular/forms';

export function normalizarPlaca(valor: string): string {
  return valor.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

const padraoPlacaAntiga = /^[A-Z]{3}\d{4}$/;
const padraoPlacaMercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/;

export function validadorPlaca(control: AbstractControl<string>): ValidationErrors | null {
  const placa = normalizarPlaca(control.value ?? '');

  if (placa.length === 0) {
    return null;
  }

  const valida = padraoPlacaAntiga.test(placa) || padraoPlacaMercosul.test(placa);

  return valida ? null : { placaInvalida: true };
}
