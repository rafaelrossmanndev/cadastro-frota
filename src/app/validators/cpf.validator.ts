import { AbstractControl, ValidationErrors } from '@angular/forms';

export function normalizarCpf(valor: string): string {
  return valor.replace(/\D/g, '');
}

function calcularDigitoVerificador(digitos: string): number {
  let soma = 0;
  let peso = digitos.length + 1;

  for (const digito of digitos) {
    soma += Number(digito) * peso;
    peso--;
  }

  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function validadorCpf(control: AbstractControl<string>): ValidationErrors | null {
  const cpf = normalizarCpf(control.value ?? '');

  if (cpf.length === 0) {
    return null;
  }

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return { cpfInvalido: true };
  }

  const primeiroDigito = calcularDigitoVerificador(cpf.slice(0, 9));
  const segundoDigito = calcularDigitoVerificador(cpf.slice(0, 9) + primeiroDigito);

  const valido = cpf[9] === String(primeiroDigito) && cpf[10] === String(segundoDigito);

  return valido ? null : { cpfInvalido: true };
}
