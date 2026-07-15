import { NativeDateAdapter } from '@angular/material/core';
import { MatDateFormats } from '@angular/material/core';

export class DataAdaptadorBr extends NativeDateAdapter {
  override parse(value: unknown): Date | null {
    if (typeof value === 'string') {
      const correspondencia = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (correspondencia) {
        const [, dia, mes, ano] = correspondencia;
        const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
        return isNaN(data.getTime()) ? null : data;
      }
      return null;
    }
    return super.parse(value);
  }

  override format(date: Date, _displayFormat: object): string {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    return `${dia}/${mes}/${date.getFullYear()}`;
  }
}

export const FORMATOS_DATA_BR: MatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
