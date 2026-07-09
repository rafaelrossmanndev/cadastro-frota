export interface Veiculo {
  readonly id: string;
  placa: string;
  marca: string;
  modelo: string;
  anoFabricacao: number;
  cor: string;
  motoristaId: string;
  lat: number;
  lng: number;
}

export type DadosVeiculo = Omit<Veiculo, 'id' | 'lat' | 'lng'>;

export interface VeiculoComMotorista extends Veiculo {
  nomeMotorista: string;
}
