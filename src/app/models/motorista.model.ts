export type CategoriaCnh = 'A' | 'B' | 'AB' | 'C' | 'D' | 'E';

export interface Motorista {
  readonly id: string;
  nome: string;
  cpf: string;
  numeroCnh: string;
  categoriaCnh: CategoriaCnh;
  validadeCnh: Date;
  telefone?: string;
  email?: string;
}

export type DadosMotorista = Omit<Motorista, 'id'>;
