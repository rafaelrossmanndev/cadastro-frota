import { Motorista } from '../models/motorista.model';
import { VeiculoComMotorista } from '../models/veiculo.model';

/**
 * Predicados de busca compartilhados entre a busca global (header/mapa) e as
 * buscas locais das telas de lista (motoristas / frota). Centralizar aqui evita
 * divergência das regras de normalização (CPF só dígitos, placa alfanumérica).
 */

/** Filtra motoristas por nome (substring) ou CPF (apenas dígitos). */
export function filtrarMotoristas(motoristas: readonly Motorista[], termo: string): Motorista[] {
  const alvo = termo.trim().toLowerCase();
  if (!alvo) return [...motoristas];

  const termoCpf = alvo.replace(/\D/g, '');

  return motoristas.filter((motorista) => {
    const nomeCorresponde = motorista.nome.toLowerCase().includes(alvo);
    const cpfCorresponde = termoCpf.length > 0 && motorista.cpf.includes(termoCpf);
    return nomeCorresponde || cpfCorresponde;
  });
}

/** Filtra veículos por "marca modelo", nome do motorista ou placa (alfanumérica). */
export function filtrarVeiculos(
  veiculos: readonly VeiculoComMotorista[],
  termo: string,
): VeiculoComMotorista[] {
  const alvo = termo.trim().toLowerCase();
  if (!alvo) return [...veiculos];

  const termoPlaca = alvo.toUpperCase().replace(/[^A-Z0-9]/g, '');

  return veiculos.filter((veiculo) => {
    const nomeVeiculo = `${veiculo.marca} ${veiculo.modelo}`.toLowerCase();
    const nomeMotoristaCorresponde = veiculo.nomeMotorista.toLowerCase().includes(alvo);
    const placaCorresponde = termoPlaca.length > 0 && veiculo.placa.includes(termoPlaca);
    return nomeVeiculo.includes(alvo) || nomeMotoristaCorresponde || placaCorresponde;
  });
}
