export interface Veiculo {
  readonly id: string;
  placa: string;
  marca: string;
  modelo: string;
  anoFabricacao: number;
  cor: string;
  motoristaId: string;
}

export type DadosVeiculo = Omit<Veiculo, 'id'>;
