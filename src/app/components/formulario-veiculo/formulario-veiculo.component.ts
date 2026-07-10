import { Component, computed, effect, inject, input } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { VeiculoService } from '../../services/veiculo.service';
import { MotoristaService } from '../../services/motorista.service';
import { DadosVeiculo } from '../../models/veiculo.model';
import { Motorista } from '../../models/motorista.model';
import { normalizarPlaca, validadorPlaca } from '../../validators/placa.validator';
import { filtrarMotoristas } from '../../utils/busca.util';

interface ControlesFormularioVeiculo {
  placa: FormControl<string>;
  marca: FormControl<string>;
  modelo: FormControl<string>;
  anoFabricacao: FormControl<number>;
  cor: FormControl<string>;
  motoristaId: FormControl<string | null>;
}

const anoAtual = new Date().getFullYear();

@Component({
  selector: 'app-formulario-veiculo',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
  ],
  templateUrl: './formulario-veiculo.component.html',
  styleUrl: './formulario-veiculo.component.scss',
})
export class FormularioVeiculoComponent {
  private readonly veiculoService = inject(VeiculoService);
  private readonly motoristaService = inject(MotoristaService);
  private readonly roteador = inject(Router);

  readonly id = input<string>();

  readonly estaEditando = computed(() => this.id() !== undefined);

  readonly motoristas = this.motoristaService.motoristas;

  /** Campo de texto/seleção do autocomplete (guarda a string digitada ou o Motorista escolhido). */
  readonly controleBuscaMotorista = new FormControl<string | Motorista>('', { nonNullable: true });

  private readonly termoMotorista = toSignal(this.controleBuscaMotorista.valueChanges, {
    initialValue: '' as string | Motorista,
  });

  /** Motoristas filtrados por nome enquanto digita (reutiliza a util de busca). */
  readonly motoristasFiltrados = computed<Motorista[]>(() => {
    const valor = this.termoMotorista();
    const termo = typeof valor === 'string' ? valor : (valor?.nome ?? '');
    return filtrarMotoristas(this.motoristas(), termo);
  });

  readonly formulario = new FormGroup<ControlesFormularioVeiculo>({
    placa: new FormControl('', { nonNullable: true, validators: [Validators.required, validadorPlaca] }),
    marca: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    modelo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    anoFabricacao: new FormControl(anoAtual, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1950), Validators.max(anoAtual + 1)],
    }),
    cor: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    motoristaId: new FormControl<string | null>(null, { validators: [Validators.required] }),
  });

  /** Exibe o nome do motorista selecionado no input do autocomplete. */
  readonly exibirMotorista = (motorista: Motorista | string | null): string =>
    motorista && typeof motorista !== 'string' ? motorista.nome : '';

  constructor() {
    this.formulario.controls.placa.valueChanges.pipe(takeUntilDestroyed()).subscribe((valor) => {
      const valorMaiusculo = valor.toUpperCase();
      if (valorMaiusculo !== valor) {
        this.formulario.controls.placa.setValue(valorMaiusculo, { emitEvent: false });
      }
    });

    // Texto livre (sem opção escolhida) invalida a seleção para o `required` continuar valendo.
    this.controleBuscaMotorista.valueChanges.pipe(takeUntilDestroyed()).subscribe((valor) => {
      if (typeof valor === 'string') {
        this.formulario.controls.motoristaId.setValue(null);
      }
    });

    effect(() => {
      const idVeiculo = this.id();
      const veiculo = idVeiculo ? this.veiculoService.buscarPorId(idVeiculo) : undefined;

      if (veiculo) {
        this.formulario.patchValue(veiculo);
        const motorista = this.motoristas().find((m) => m.id === veiculo.motoristaId);
        if (motorista) {
          this.controleBuscaMotorista.setValue(motorista, { emitEvent: false });
        }
      }
    });
  }

  selecionarMotorista(motorista: Motorista): void {
    this.formulario.controls.motoristaId.setValue(motorista.id);
    this.formulario.controls.motoristaId.markAsTouched();
  }

  salvar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const dadosVeiculo: DadosVeiculo = {
      placa: normalizarPlaca(valores.placa),
      marca: valores.marca,
      modelo: valores.modelo,
      anoFabricacao: valores.anoFabricacao,
      cor: valores.cor,
      motoristaId: valores.motoristaId!,
    };

    const idVeiculo = this.id();
    if (idVeiculo) {
      this.veiculoService.atualizar(idVeiculo, dadosVeiculo);
    } else {
      this.veiculoService.adicionar(dadosVeiculo);
    }

    this.roteador.navigate(['/veiculos']);
  }
}
