import { Injectable, signal } from '@angular/core';
import { DadosMotorista, Motorista } from '../models/motorista.model';

const motoristasIniciais: Motorista[] = [
  {
    id: crypto.randomUUID(),
    nome: 'Maria Oliveira Santos',
    cpf: '52998224725',
    numeroCnh: '02650306461',
    categoriaCnh: 'AB',
    validadeCnh: new Date(2027, 5, 15),
    telefone: '(11) 98888-7766',
    email: 'maria.santos@example.com',
  },
  {
    id: crypto.randomUUID(),
    nome: 'João Pereira Costa',
    cpf: '11144477735',
    numeroCnh: '01234567890',
    categoriaCnh: 'D',
    validadeCnh: new Date(2024, 2, 10),
    telefone: '(21) 97777-5544',
  },
];

@Injectable({ providedIn: 'root' })
export class MotoristaService {
  readonly #motoristas = signal<Motorista[]>(motoristasIniciais);

  readonly motoristas = this.#motoristas.asReadonly();

  listarTodos(): Motorista[] {
    return this.#motoristas();
  }

  buscarPorId(id: string): Motorista | undefined {
    return this.#motoristas().find((motorista) => motorista.id === id);
  }

  adicionar(dados: DadosMotorista): Motorista {
    const motorista: Motorista = { ...dados, id: crypto.randomUUID() };
    this.#motoristas.update((motoristas) => [...motoristas, motorista]);
    return motorista;
  }

  atualizar(id: string, alteracoes: DadosMotorista): void {
    this.#motoristas.update((motoristas) =>
      motoristas.map((motorista) => (motorista.id === id ? { ...alteracoes, id } : motorista)),
    );
  }

  remover(id: string): void {
    this.#motoristas.update((motoristas) => motoristas.filter((motorista) => motorista.id !== id));
  }
}
