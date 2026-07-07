import { AbstractControl, ValidationErrors } from '@angular/forms';

function inicioDoDia(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

export function validadorValidadeCnh(control: AbstractControl<Date | null>): ValidationErrors | null {
  const valor = control.value;

  if (!valor) {
    return null;
  }

  const vencida = inicioDoDia(valor).getTime() < inicioDoDia(new Date()).getTime();

  return vencida ? { cnhVencida: true } : null;
}
